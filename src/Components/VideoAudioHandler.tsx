//@ts-nocheck

// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../Classes/Media';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";


interface IProps {
  keyID:            number,
  media:            Media,
  url:              string,
  masterTime:       number,
  updateMasterTime: any,
  playing:          boolean,
  playbackSpeed:    number,
  muteMedia:        boolean,
  audioContext:     any,
  gainNode:         any
}

interface IState {
  url:              string | null,
  pip:              boolean,
  controls:         boolean,
  light:            boolean,
  volume:           number,
  played:           number,
  loaded:           number,
  duration:         number,
  loop:             boolean,
  seeking:          boolean,
  lastPlayed:       number | null,
}


type playerRef = HTMLInputElement;

/////////////////////////////////////////////////////////////

class VideoAudioHandler extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      url: null,
      pip: false,
      controls: false,
      light: false,
      volume: 1,
      played: 0,
      loaded: 0,
      duration: 0,
      loop: false,
      seeking: false,
      lastPlayed: 0,
      previousMasterTime: this.props.masterTime,
    }
    this.playerRef = React.createRef();
    this.audioSource = null;
  }

  componentDidMount(): void {
    this.syncWithMasterTime();
  }

  componentDidUpdate(): void {
    if (Math.abs(this.state.previousMasterTime - this.props.masterTime) > 2000) {
      this.setState({ previousMasterTime: this.props.masterTime });
      this.syncWithMasterTime();
    }
  }

  componentWillUnmount(): void {
    if (this.audioSource)  {
      this.audioSource.disconnect();
    }
  }

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handleStop = () => {
    this.setState({ url: null, playing: false })
  }

  handleToggleLight = () => {
    this.setState({ light: !this.state.light })
  }

  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop })
  }

  handleVolumeChange = e => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted })
  }

  handleSetPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleOnPlaybackRateChange = (speed: number) => {
    this.setState({ playbackRate: parseFloat(speed) })
  }

  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip })
  }

  handlePlay = () => {
    // console.log('onPlay')
    this.setState({ playing: true })
  }

  handleEnablePIP = () => {
    console.log('onEnablePIP')
    this.setState({ pip: true })
  }

  handleDisablePIP = () => {
    console.log('onDisablePIP')
    this.setState({ pip: false })
  }

  handlePause = (e: Event) => {
    console.log('onPause')
    // this.setState({ playing: false });
    this.syncWithMasterTime();
    // this.player.seekTo(this.findSeekPosition(), "seconds");
    
  }

  syncWithMasterTime = () => {
    this.playerRef.seekTo(this.findSeekPosition(), "seconds");
    // this.setState(prevState => ({ lastPlayed: prevState.played }));
  }

  findSeekPosition = () => {
    // this.props.media is never NULL 
    var msFromStart = this.props.masterTime - this.props.media.startTime;
    console.log({msFromStart});
    return msFromStart / 1000;
  }

  handleSeekMouseDown = e => {
    this.setState({ seeking: true })
  }

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })
  }

  handleSeekMouseUp = e => {
    this.setState({ seeking: false })
    this.player.seekTo(parseFloat(e.target.value))
  }

  handleProgress = state => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    // if (!this.state.seeking) {
    //   this.setState(state)
    // }
    this.setState({ previousMasterTime: this.props.masterTime });
  }

  handleEnded = () => {
    // console.log('onEnded')
    this.setState({ playing: this.state.loop }) 

    // remove source video from player 
    this.setState({ url: null });
    
  }

  handleDuration = (duration: number) => {
    // console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleReady = () => {
    // console.log('onReady');
    // if (this.state.lastPlayed !== this.state.played) {
    //   this.syncWithMasterTime();  
    // }
  }

  ref = (player: any) => {
    this.playerRef = player
  }

  connectWebAudioAPI = () => {
    let audioCxt = this.props.audioContext;

    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it\
    const sourceType = this.props.media.mediaType;
    if (this.audioSource == null) {
      const thisAudioSource = document.querySelector('#player-' + this.props.keyID + ' > div.react-player > ' + sourceType);
      this.audioSource = audioCxt.createMediaElementSource(thisAudioSource);

      // connect the AudioBufferSourceNode to the gainNode in StreamManager
      this.audioSource.connect(this.props.gainNode);
    
    }
    
  }
  
  render() { 
    return (
      <div id={"player-" + this.props.keyID}>
        {/* {this.props.media.mediaType === 'Audio' && <canvas ref={this.canvas} id="myCanvas" width="320" height="175"></canvas>} */}
        {this.props.media.mediaType === 'Audio' && <img src="speaker_icon.svg" style={{"height": "175px"}}></img>}
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={rootDir + this.props.media.getSource()}
          pip={this.state.pip}
          playing={this.props.playing}
          controls={this.state.controls}
          light={this.state.light}
          loop={this.state.loop}
          playbackRate={this.props.playbackSpeed}
          // volume={this.state.volume}
          muted={this.props.muteMedia}
          onReady={this.handleReady}
          // onStart={() => console.log('onStart')}
          onPlay={this.handlePlay}
          onEnablePIP={this.handleEnablePIP}
          onDisablePIP={this.handleDisablePIP}
          onPause={this.handlePause}
          // onBuffer={() => console.log('onBuffer')}
          onPlaybackRateChange={this.handleOnPlaybackRateChange}
          onSeek={e => console.log('onSeek', e)}
          onEnded={this.handleEnded}
          onError={e => console.log('onError', e)}
          onProgress={this.handleProgress}
          onDuration={this.handleDuration}
          onLoadedData={this.connectWebAudioAPI}
        />
      </div>
    );
  }
}
 
export default VideoAudioHandler;