class MediaItem {
    constructor(src, type, duration = null) {
        this.src = src;
        this.type = type;
        this.duration = duration;
    }
    static createFromData(data) {
        if (data.type === 'video') return new VideoMedia(data.src);
        if (data.type === 'image') return new ImageMedia(data.src, data.duration || 3);
        throw new Error(`Неизвестный тип: ${data.type}`);
    }
}

class VideoMedia extends MediaItem { 
    constructor(src) { 
        super(src, 'video'); 
    } 
}

class ImageMedia extends MediaItem { 
    constructor(src, duration) { 
        super(src, 'image', duration); 
    } 
}

class Channel {
    constructor(name, mediaItems) {
        this.name = name;
        this.mediaItems = mediaItems;
    }
}

class ChannelPlayer {
    constructor(channel, containerElement, options = {}) {
        this.channel = channel;
        this.container = containerElement;
        this.isMain = options.isMain || false;
        this.autoplayEnabled = options.autoplayEnabled !== undefined ? options.autoplayEnabled : true;
        this.volume = options.volume || (this.isMain ? 1 : 0);
        this.currentMediaIndex = 0;
        this.currentMediaElement = null;
        this.slideshowTimer = null;
        this.isPlaying = false;
        this.onStateChange = options.onStateChange || null;
        this.currentTime = 0;
        this.isActive = options.isActive !== undefined ? options.isActive : false;
        
        this.playPauseIcon = document.getElementById('playPauseIcon');
        
        if (options.initialState) {
            this.currentMediaIndex = options.initialState.currentMediaIndex ?? 0;
            this.isPlaying = options.initialState.isPlaying ?? false;
            this.currentTime = options.initialState.currentTime ?? 0;
        }
        
        this.onMediaEnded = this.onMediaEnded.bind(this);
        this.onMediaError = this.onMediaError.bind(this);
        
        this.initPlayer();
    }
    
    initPlayer() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.loadMedia();
        if (this.isMain && window.updateMainPlayPauseVisibility) {
            window.updateMainPlayPauseVisibility();
        }
    }
    
    loadMedia(autoPlay = this.autoplayEnabled) {
        this.clearMedia();
        if (!this.channel || this.channel.mediaItems.length === 0) {
            if (this.container) this.container.innerHTML = '<div class="error">Нет медиа</div>';
            return;
        }
        const media = this.channel.mediaItems[this.currentMediaIndex];
        this.createMediaElement(media);
        
        if (autoPlay) {
            this.play();
        } else {
            this.isPlaying = false;
            if (this.isMain && this.mainPlayerUpdatePlayPause) {
                this.mainPlayerUpdatePlayPause(false);
            }
        }
        if (this.isMain && window.updateMainPlayPauseVisibility) {
            window.updateMainPlayPauseVisibility();
        }
    }

    updateCurrentTime(){
        if (this.currentMediaElement.readyState >= 2) {
            this.currentTime = this.currentMediaElement.currentTime;
        } else {
            this.currentTime = 0;
        }
    };
    
    createMediaElement(media) {
        if (!this.container) return;
        let element;
        if (media.type === 'video') {
            element = document.createElement('video');
            element.src = media.src;
            element.controls = false;
            element.volume = this.volume;
            if (!this.isMain) element.muted = true;
            
            const savedTime = this.currentTime || 0;
            const shouldPlay = this.isPlaying;
            element.addEventListener('loadedmetadata', () => {
                if (savedTime > 0 && savedTime < element.duration) {
                    element.currentTime = savedTime;
                }
                if (shouldPlay) {
                    this.play();
                }
            }, { once: true });
            
            element.addEventListener('ended', this.onMediaEnded);
            element.addEventListener('error', this.onMediaError);
        } else {
            element = document.createElement('img');
            element.src = media.src;
            element.alt = media.type;
            if (media.duration && this.autoplayEnabled && this.isPlaying) {
                this.slideshowTimer = setTimeout(() => this.onMediaEnded(), media.duration * 1000);
            }
            element.addEventListener('error', this.onMediaError);
        }
        this.currentMediaElement = element;
        this.container.innerHTML = '';
        this.container.appendChild(element);
    }
    
    play() {
        if (!this.currentMediaElement) return;
        if (this.currentMediaElement.tagName === 'VIDEO') {
            this.updateCurrentTime();
            this.currentMediaElement.play().catch(e => {
                if (e.name === 'NotAllowedError') {
                    if (!this.isMain && !this.currentMediaElement.muted) {
                        this.currentMediaElement.muted = true;
                        this.currentMediaElement.play().catch(console.warn);
                    }
                } else {
                    this.onMediaError();
                }
            });
        } else if (this.currentMediaElement.tagName === 'IMG') {
            if (this.autoplayEnabled && !this.slideshowTimer) {
                const media = this.channel.mediaItems[this.currentMediaIndex];
                if (media && media.duration) {
                    this.slideshowTimer = setTimeout(() => this.onMediaEnded(), media.duration * 1000);
                }
            }
        }
        this.isPlaying = true;
        if (this.isMain && this.mainPlayerUpdatePlayPause) {
            this.mainPlayerUpdatePlayPause(true);
        }
        this.notifyStateChange();
    }
    
    pause() {
        if (this.currentMediaElement){
            if (this.currentMediaElement.tagName === 'VIDEO') {
                this.updateCurrentTime();
                this.currentMediaElement.pause();
            } else {
                if (this.slideshowTimer) {
                    clearTimeout(this.slideshowTimer);
                    this.slideshowTimer = null;
                }
            }
            this.isPlaying = false;
            if (this.isMain && this.mainPlayerUpdatePlayPause) {
                this.mainPlayerUpdatePlayPause(false);
            }
            this.notifyStateChange();
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) this.pause();
        else this.play();
    }
    
    next() {
        if (!this.channel) return;
        this.currentMediaIndex = (this.currentMediaIndex + 1) % this.channel.mediaItems.length;
        this.currentTime = 0;
        this.applyTransition(() => this.loadMedia());
        this.notifyStateChange();
    }
    
    prev() {
        if (!this.channel) return;
        const mainChannelLength = this.channel.mediaItems.length;
        this.currentMediaIndex = (this.currentMediaIndex - 1 + mainChannelLength) % mainChannelLength;
        this.currentTime = 0;
        this.applyTransition(() => this.loadMedia());
        this.notifyStateChange();
    }
    
    onMediaEnded() {
        if (this.isMain) {
            if (this.autoplayEnabled) {
                this.next();
            } else {
                this.isPlaying = false;
                if (this.mainPlayerUpdatePlayPause) this.mainPlayerUpdatePlayPause(false);
                this.notifyStateChange();
            }
            return;
        }
        
        if (!this.isActive && this.autoplayEnabled) {
            this.next();
        } else {
            this.isPlaying = false;
            this.notifyStateChange();
        }
    }
    
    onMediaError() {
        if (this.isMain) {
            if (this.autoplayEnabled) {
                this.next();
            } else {
                this.isPlaying = false;
                if (this.mainPlayerUpdatePlayPause) this.mainPlayerUpdatePlayPause(false);
                this.notifyStateChange();
            }
            return;
        }
        
        if (!this.isActive && this.autoplayEnabled) {
            this.next();
        } else {
            this.isPlaying = false;
            this.notifyStateChange();
        }
    }
    
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this);
        }
    }
    
    applyTransition(callback) {
        if (!this.container) { callback(); return; }
        this.container.classList.add('fade-out');
        setTimeout(() => {
            callback();
            this.container.classList.remove('fade-out');
            this.container.classList.add('fade-in');
            setTimeout(() => this.container.classList.remove('fade-in'), 500);
        }, 500);
    }
    
    clearMedia() {
        if (this.currentMediaElement) {
            if (this.currentMediaElement.tagName === 'VIDEO') {
                this.updateCurrentTime();
                this.currentMediaElement.pause();
                this.currentMediaElement.removeEventListener('ended', this.onMediaEnded);
                this.currentMediaElement.removeEventListener('error', this.onMediaError);
            } else {
                if (this.slideshowTimer) {
                    clearTimeout(this.slideshowTimer);
                    this.slideshowTimer = null;
                }
            }
            if (this.currentMediaElement.parentNode) this.currentMediaElement.remove();
            this.currentMediaElement = null;
        }
    }
    
    setVolume(value) {
        if (!this.isMain) return;
        this.volume = parseFloat(value);
        if (this.currentMediaElement && this.currentMediaElement.tagName === 'VIDEO') {
            this.currentMediaElement.volume = this.volume;
        }
    }
    
    setAutoplay(enabled) {
        this.autoplayEnabled = enabled;
        if (!enabled && this.slideshowTimer) {
            clearTimeout(this.slideshowTimer);
            this.slideshowTimer = null;
        }
        if (enabled &&this.currentMediaElement?.tagName === 'IMG' && !this.slideshowTimer && this.isPlaying) {
            const media = this.channel.mediaItems[this.currentMediaIndex];
            if (media?.duration) {
                this.slideshowTimer = setTimeout(() => this.onMediaEnded(), media.duration * 1000);
            }
        }
    }
    
    updateChannel(newChannel, initialState = null) {
        this.channel = newChannel;
        if (initialState) {
            this.currentMediaIndex = initialState.currentMediaIndex ?? 0;
            this.isPlaying = initialState.isPlaying ?? false;
            this.currentTime = initialState.currentTime ?? 0;
        } else {
            this.currentMediaIndex = 0;
            this.isPlaying = false;
            this.currentTime = 0;
        }
        this.loadMedia();
        this.notifyStateChange();
    }

    mainPlayerUpdatePlayPause = (isPlaying) => {
        /*if (isPlaying) {
            this.playPauseIcon.classList.add('icon-play');
            this.playPauseIcon.classList.add('icon-play:hover');
            this.playPauseIcon.classList.remove('icon-pause');
            this.playPauseIcon.classList.remove('icon-pause:hover');
        } else {
            this.playPauseIcon.classList.add('icon-pause');
            this.playPauseIcon.classList.add('icon-pause:hover');
            this.playPauseIcon.classList.remove('icon-play');
            this.playPauseIcon.classList.remove('icon-play:hover');
        }*/
        this.playPauseIcon.classList.toggle('icon-play', !isPlaying);
        this.playPauseIcon.classList.toggle('icon-play:hover', !isPlaying);
        this.playPauseIcon.classList.toggle('icon-pause', isPlaying);
        this.playPauseIcon.classList.toggle('icon-pause:hover', isPlaying);
    };
}

class AppManager {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.channels = [];
        this.mainChannelPlayer = null;
        this.sidebarPlayers = [];
        this.sidebarOffset = 0;
        this.previousVolume = 1;
        
        this.mainMediaContainer = document.getElementById('mainMediaContainer');
        this.channelsListEl = document.getElementById('channelsList');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.volumeInput = document.getElementById('volume');
        this.autoplayToggle = document.getElementById('autoplayToggle');
        this.scrollUpBtn = document.getElementById('scrollUpBtn');
        this.scrollDownBtn = document.getElementById('scrollDownBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.prevChannelBtn = document.getElementById('prevChannelBtn');
        this.nextChannelBtn = document.getElementById('nextChannelBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.customScrollbar = document.getElementById('customScrollbar');
        this.scrollbarTrack = document.getElementById('scrollbarTrack');
        this.scrollbarThumb = document.getElementById('scrollbarThumb');
        
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartOffset = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        if (this.channels.length){
            this.createMainPlayer(this.channels[0]);
            this.renderSidebar();
            this.attachGlobalEvents();
            this.updateScrollbar();
        }
    }
    
    async loadData() {
        try {
            const resp = await fetch(this.dataUrl);
            if (!resp.ok) throw new Error('Ошибка загрузки');
            const data = await resp.json();
            this.channels = data.map(chData => {
                const media = chData.media.map(m => MediaItem.createFromData(m));
                return new Channel(chData.name, media);
            });
        } catch(e) {
            console.error(e);
            this.mainMediaContainer.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
        }
    }
    
    createMainPlayer(channel, initialState = null) {
        if (this.mainChannelPlayer) {
            this.mainChannelPlayer.clearMedia();
        }
        const options = {
            isMain: true,
            autoplayEnabled: this.autoplayToggle.checked,
            volume: parseFloat(this.volumeInput.value),
            onStateChange: (player) => {
                this.syncSidebarPlayer(player.channel.name);
            },
            isActive: true
        };
        if (initialState) {
            options.initialState = initialState;
        }
        this.mainChannelPlayer = new ChannelPlayer(channel, this.mainMediaContainer, options);
    }
    
    setMainChannel(channel, sidebarState = null) {
        if (this.mainChannelPlayer?.channel.name !== channel.name || sidebarState) {
            this.createMainPlayer(channel, sidebarState);
        }
        const idx = this.channels.findIndex(c => c.name === channel.name);
        if (idx !== -1 && (idx < this.sidebarOffset || idx >= this.sidebarOffset + 3)) {
            this.sidebarOffset = Math.max(0, Math.min(idx, this.channels.length - 3));
        }
        this.renderSidebar();
        this.updateMainPlayPauseVisibility();
        this.updateMuteButtonState();
        this.updateScrollbar();
    }
    
    updateMainPlayPauseVisibility() {
        if (!this.mainChannelPlayer) return;
        const isImage = this.mainChannelPlayer.currentMediaElement?.tagName === 'IMG';
        this.playPauseBtn.classList.toggle('invisible', isImage);

        if (this.muteBtn) {
            const checkingMute = isImage || this.mainChannelPlayer.currentMediaElement?.tagName !== 'VIDEO';
            this.muteBtn.classList.toggle('invisible', checkingMute);
        }
    }
    
    updateMuteButtonState() {
        if (!this.mainChannelPlayer) return;
        const video = this.mainChannelPlayer.currentMediaElement;
        if (!video || video.tagName !== 'VIDEO') return;
        const isMuted = video.volume === 0;
        const iconOn = this.muteBtn.querySelector('.icon-volume-on');
        const iconOff = this.muteBtn.querySelector('.icon-volume-off');
        iconOff.classList.toggle('invisible', !isMuted);
        iconOn.classList.toggle('invisible', isMuted);
    }
    
    toggleMute() {
        if (!this.mainChannelPlayer) return;
        const video = this.mainChannelPlayer.currentMediaElement;
        if (!video || video.tagName !== 'VIDEO') return;
        if (video.volume > 0) {
            this.previousVolume = video.volume;
            video.volume = 0;
            this.volumeInput.value = 0;
        } else {
            const newVol = this.previousVolume > 0 ? this.previousVolume : 1;
            video.volume = newVol;
            this.volumeInput.value = newVol;
        }
        this.updateMuteButtonState();
    }
    
    syncSidebarPlayer(channelName) {
        const sidebarPlayer = this.sidebarPlayers.find(p => p.channel.name === channelName);
        const main = this.mainChannelPlayer;
        if (!sidebarPlayer?.container || main?.channel.name !== channelName) return;
        
        const needReload = (sidebarPlayer.currentMediaIndex !== main.currentMediaIndex);
        if (needReload) {
            sidebarPlayer.currentMediaIndex = main.currentMediaIndex;
            sidebarPlayer.currentTime = main.currentTime;
            sidebarPlayer.loadMedia(false);
        }
        if (main.currentMediaElement?.tagName === 'VIDEO') {
            main.updateCurrentTime();
        }
        if (sidebarPlayer.currentMediaElement?.tagName === 'VIDEO') {
            const targetTime = main.currentTime;
            if (Math.abs(sidebarPlayer.currentMediaElement.currentTime - targetTime) > 0.5) {
                sidebarPlayer.currentMediaElement.currentTime = targetTime;
            }
        }
        if (main.isPlaying) {
            sidebarPlayer.play();
        } else {
            sidebarPlayer.pause();
        }
    }
    
    updateScrollbar() {
        const total = this.channels.length;
        const visibleCount = 3;
        if (total <= visibleCount) {
            this.customScrollbar.classList.add('hidden');
            return;
        }
        this.customScrollbar.classList.remove('hidden');
        
        const track = this.scrollbarTrack;
        const thumb = this.scrollbarThumb;
        if (!track || !thumb) return;
        
        const trackHeight = track.clientHeight;
        const thumbHeight = Math.max(20, (visibleCount / total) * trackHeight);
        thumb.style.height = thumbHeight + 'px';
        
        const maxOffset = total - visibleCount;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = maxOffset > 0 ? (this.sidebarOffset / maxOffset) * maxThumbTop : 0;
        thumb.style.top = thumbTop + 'px';
    }
    
    onThumbMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.dragStartY = e.clientY;
        this.dragStartOffset = this.sidebarOffset;
        document.addEventListener('mousemove', this.onDocumentMouseMove);
        document.addEventListener('mouseup', this.onDocumentMouseUp);
    }
    
    onDocumentMouseMove = (e) => {
        if (!this.isDragging) return;
        const track = this.scrollbarTrack;
        const thumb = this.scrollbarThumb;
        if (!track || !thumb) return;
        
        const trackRect = track.getBoundingClientRect();
        const trackHeight = trackRect.height;
        const thumbHeight = thumb.clientHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const deltaY = e.clientY - this.dragStartY;
        
        const total = this.channels.length;
        const visibleCount = 3;
        const maxOffset = total - visibleCount;
        if (maxOffset <= 0) return;
        
        const startThumbTop = (this.dragStartOffset / maxOffset) * maxThumbTop;
        const newThumbTop = Math.min(maxThumbTop, Math.max(0, startThumbTop + deltaY));
        const newOffset = Math.round((newThumbTop / maxThumbTop) * maxOffset);
        
        if (newOffset !== this.sidebarOffset) {
            this.sidebarOffset = Math.min(maxOffset, Math.max(0, newOffset));
            this.renderSidebar();
        }
    }
    
    onDocumentMouseUp = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
    }
    
    renderSidebar() {
        if (!this.channelsListEl) return;
        this.channelsListEl.innerHTML = '';
        const allChannels = this.channels;
        const total = allChannels.length;
        if (this.sidebarOffset > total - 3) {
            this.sidebarOffset = Math.max(0, total - 3);
        }
        const start = this.sidebarOffset;
        const end = Math.min(start + 3, total);
        const visibleChannels = allChannels.slice(start, end);
        const mainChannelName = this.mainChannelPlayer ? this.mainChannelPlayer.channel.name : null;

        visibleChannels.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            const isActiveChannel = (channel.name === mainChannelName);
            if (isActiveChannel) {
                card.classList.add('active');
            }
            const titleDiv = document.createElement('div');
            titleDiv.className = 'channel-title';
            titleDiv.textContent = channel.name;
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'channel-media-container';
            card.appendChild(titleDiv);
            card.appendChild(mediaDiv);
            
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                if (channel.name !== mainChannelName) {
                    const sidebarPlayer = this.sidebarPlayers.find(p => p.channel.name === channel.name);
                    let state = null;
                    if (sidebarPlayer) {
                        state = {
                            currentMediaIndex: sidebarPlayer.currentMediaIndex,
                            isPlaying: sidebarPlayer.isPlaying,
                            currentTime: sidebarPlayer.currentTime || 0
                        };
                        if (sidebarPlayer.currentMediaElement?.tagName === 'VIDEO' && sidebarPlayer.currentMediaElement.readyState >= 2) {
                            state.currentTime = sidebarPlayer.currentMediaElement.currentTime;
                        }
                    }
                    const currentMainName = this.mainChannelPlayer.channel.name;
                    const existingPlayer = this.sidebarPlayers.find(p => p.channel.name === currentMainName);
                    if (existingPlayer) {
                        existingPlayer.currentMediaIndex = this.mainChannelPlayer.currentMediaIndex;
                        existingPlayer.isPlaying = this.mainChannelPlayer.isPlaying;
                        if (this.mainChannelPlayer.currentMediaElement?.tagName === 'VIDEO') {
                            existingPlayer.currentTime = this.mainChannelPlayer.currentMediaElement.currentTime;
                        }
                    }
                    this.setMainChannel(channel, state);
                }
            });
            this.channelsListEl.appendChild(card);

            let player = this.sidebarPlayers.find(p => p.channel.name === channel.name);
            if (player) {
                player.container = mediaDiv;
                player.isActive = isActiveChannel;
                if (isActiveChannel) {
                    player.loadMedia(false);
                } else {
                    player.loadMedia(true);
                }
            } else {
                player = new ChannelPlayer(channel, mediaDiv, {
                    isMain: false,
                    autoplayEnabled: !isActiveChannel,
                    volume: 0,
                    isActive: isActiveChannel
                });
                this.sidebarPlayers.push(player);
            }
        });

        const visibleNames = visibleChannels.map(c => c.name);
        this.sidebarPlayers.forEach(player => {
            if (!visibleNames.includes(player.channel.name)) {
                player.clearMedia();
            } else {
                player.isActive = (player.channel.name === mainChannelName);
            }
        });

        if (mainChannelName && visibleNames.includes(mainChannelName)) {
            this.syncSidebarPlayer(mainChannelName);
        }

        this.updateScrollButtons();
        this.updateScrollbar();
    }
    
    updateScrollButtons() {
        if (this.scrollUpBtn) this.scrollUpBtn.disabled = (this.sidebarOffset === 0);
        if (this.scrollDownBtn) this.scrollDownBtn.disabled = (this.sidebarOffset + 3 >= this.channels.length);
    }
    
    scrollUp() {
        if (this.sidebarOffset > 0) {
            this.sidebarOffset--;
            this.renderSidebar();
            return true;
        }
        return false;
    }
    
    scrollDown() {
        if (this.sidebarOffset + 3 < this.channels.length) {
            this.sidebarOffset++;
            this.renderSidebar();
            return true;
        }
        return false;
    }
    
    prevChannel() {
        const currentChannel = this.mainChannelPlayer.channel;
        const currentIndex = this.channels.findIndex(c => c.name === currentChannel.name);
        if (currentIndex === -1) return;
        const newIndex = (currentIndex - 1 + this.channels.length) % this.channels.length;
        const targetChannel = this.channels[newIndex];
        
        let state = null;
        const sidebarPlayer = this.sidebarPlayers.find(p => p.channel.name === targetChannel.name);
        if (sidebarPlayer) {
            state = {
                currentMediaIndex: sidebarPlayer.currentMediaIndex,
                isPlaying: sidebarPlayer.isPlaying,
                currentTime: sidebarPlayer.currentTime || 0
            };
            if (sidebarPlayer.currentMediaElement?.tagName === 'VIDEO' && sidebarPlayer.currentMediaElement.readyState >= 2) {
                state.currentTime = sidebarPlayer.currentMediaElement.currentTime;
            }
        }
        
        const currentMainName = this.mainChannelPlayer.channel.name;
        const existingPlayer = this.sidebarPlayers.find(p => p.channel.name === currentMainName);
        if (existingPlayer) {
            existingPlayer.currentMediaIndex = this.mainChannelPlayer.currentMediaIndex;
            existingPlayer.isPlaying = this.mainChannelPlayer.isPlaying;
            if (this.mainChannelPlayer.currentMediaElement?.tagName === 'VIDEO') {
                existingPlayer.currentTime = this.mainChannelPlayer.currentMediaElement.currentTime || 0;
            }
        }
        this.setMainChannel(targetChannel, state);
    }
    
    nextChannel() {
        const currentChannel = this.mainChannelPlayer.channel;
        const currentIndex = this.channels.findIndex(c => c.name === currentChannel.name);
        if (currentIndex === -1) return;
        const newIndex = (currentIndex + 1) % this.channels.length;
        const targetChannel = this.channels[newIndex];
        
        let state = null;
        const sidebarPlayer = this.sidebarPlayers.find(p => p.channel.name === targetChannel.name);
        if (sidebarPlayer) {
            state = {
                currentMediaIndex: sidebarPlayer.currentMediaIndex,
                isPlaying: sidebarPlayer.isPlaying,
                currentTime: sidebarPlayer.currentTime || 0
            };
            if (sidebarPlayer.currentMediaElement?.tagName === 'VIDEO' && sidebarPlayer.currentMediaElement.readyState >= 2) {
                state.currentTime = sidebarPlayer.currentMediaElement.currentTime;
            }
        }
        
        const currentMainName = this.mainChannelPlayer.channel.name;
        const existingPlayer = this.sidebarPlayers.find(p => p.channel.name === currentMainName);
        if (existingPlayer) {
            existingPlayer.currentMediaIndex = this.mainChannelPlayer.currentMediaIndex;
            existingPlayer.isPlaying = this.mainChannelPlayer.isPlaying;
            if (this.mainChannelPlayer.currentMediaElement?.tagName === 'VIDEO') {
                existingPlayer.currentTime = this.mainChannelPlayer.currentMediaElement.currentTime || 0;
            }
        }
        this.setMainChannel(targetChannel, state);
    }
    
    attachGlobalEvents() {
        this.playPauseBtn.addEventListener('click', () => {
            this.mainChannelPlayer.togglePlayPause();
        });
        this.prevBtn.addEventListener('click', () => {
            this.mainChannelPlayer.prev();
        });
        this.nextBtn.addEventListener('click', () => {
            this.mainChannelPlayer.next();
        });
        this.volumeInput.addEventListener('input', (e) => {
            this.mainChannelPlayer.setVolume(e.target.value);
            this.updateMuteButtonState();
        });
        this.autoplayToggle.addEventListener('change', (e) => {
            this.mainChannelPlayer.setAutoplay(e.target.checked);
        });
        this.scrollUpBtn.addEventListener('click', () => this.scrollUp());
        this.scrollDownBtn.addEventListener('click', () => this.scrollDown());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.prevChannelBtn.addEventListener('click', () => this.prevChannel());
        this.nextChannelBtn.addEventListener('click', () => this.nextChannel());

        this.channelsListEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.scrollDown();
            } else if (e.deltaY < 0) {
                this.scrollUp();
            }
        }, { passive: false });
        
        this.scrollbarThumb.addEventListener('mousedown', (e) => this.onThumbMouseDown(e));
        
        this.scrollbarTrack.addEventListener('mousedown', (e) => {
            if (e.target === this.scrollbarThumb) return;
            const trackRect = this.scrollbarTrack.getBoundingClientRect();
            const thumbHeight = this.scrollbarThumb.clientHeight;
            const trackHeight = trackRect.height;
            const maxThumbTop = trackHeight - thumbHeight;
            const clickY = e.clientY - trackRect.top - thumbHeight / 2;
            const newThumbTop = Math.min(maxThumbTop, Math.max(0, clickY));
            
            const total = this.channels.length;
            const visibleCount = 3;
            const maxOffset = total - visibleCount;
            if (maxOffset <= 0) return;
            
            const newOffset = Math.round((newThumbTop / maxThumbTop) * maxOffset);
            if (newOffset !== this.sidebarOffset) {
                this.sidebarOffset = Math.min(maxOffset, Math.max(0, newOffset));
                this.renderSidebar();
            }
        });
        
        
        window.updateMainPlayPauseVisibility = () => {
            this.updateMainPlayPauseVisibility();
            this.updateMuteButtonState();
        };
        
        this.updateMainPlayPauseVisibility();
        this.mainChannelPlayer.mainPlayerUpdatePlayPause(this.mainChannelPlayer.isPlaying);
        this.updateMuteButtonState();
    }
}

new AppManager('channels.json');

/*
1. Убрать стили из html
*/