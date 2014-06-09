// Testing the controller
if (fields.master) {
  var controlReciever = io.connect('/controller');
  var getKeyframeFromCurrentHyperwallView = function(frameTitle) {
    var snaplapseForSharedTour = timelapse.getSnaplapseForSharedTour();
    var snaplapseViewerForSharedTour = snaplapseForSharedTour.getSnaplapseViewer();
    var keyframe = snaplapseForSharedTour.recordKeyframe();
    var settings = timelapse.getSettings();
    keyframe.unsafe_string_frameTitle = frameTitle;
    keyframe.centerView = timelapse.pixelBoundingBoxToLatLngCenterView(keyframe.bounds);
    keyframe.thumbnailURL = snaplapseViewerForSharedTour.generateThumbnailURL(settings["url"], keyframe.bounds, 260, 185, keyframe.time);
    return keyframe;
  };
  var previousMapLng = 0;

  controlReciever.on('connect', function() {
    console.log('controlReciever connected');
    timelapse.addVideoPlayListener(function() {
      if (timelapse.isDoingLoopingDwell())
        return;
      controlReciever.emit('handlePlayPauseController', true);
    });
    timelapse.addVideoPauseListener(function() {
      if (timelapse.isDoingLoopingDwell())
        return;
      controlReciever.emit('handlePlayPauseController', false);
    });
    timelapse.addTimeChangeListener(function() {
      controlReciever.emit('updateTimelineSliderController', timelapse.getCurrentFrameNumber());
    });
    timelapse.addPlaybackRateChangeListener(function(playbackRate) {
      controlReciever.emit('updateSpeedControlController', playbackRate);
    });
  });

  controlReciever.on('sync setControllerPlayButton', function() {
    if (timelapse.isDoingLoopingDwell())
      return;
    if (!timelapse.isPaused())
      controlReciever.emit('handlePlayPauseController', true);
    else
      controlReciever.emit('handlePlayPauseController', false);
  });

  controlReciever.on('sync addKeyframe', function(frameTitle) {
    controlReciever.emit('returnAndAddKeyframe', getKeyframeFromCurrentHyperwallView(frameTitle));
  });

  controlReciever.on('sync updateKeyframe', function(frameTitle) {
    controlReciever.emit('returnAndUpdateKeyframe', getKeyframeFromCurrentHyperwallView(frameTitle));
  });

  controlReciever.on('sync playTour', function(tourFragment) {
    var snaplapseForSharedTour = timelapse.getSnaplapseForSharedTour();
    var snaplapseViewerForSharedTour = snaplapseForSharedTour.getSnaplapseViewer();
    var tourJSON = snaplapseForSharedTour.urlStringToJSON(tourFragment);
    snaplapseForSharedTour.loadFromJSON(tourJSON, 0);
    snaplapseViewerForSharedTour.addEventListener('snaplapse-loaded', function() {
      snaplapseForSharedTour.play();
    });
  });

  controlReciever.on('sync encodeTour', function(tourJSON) {
    controlReciever.emit('returnEncodeTour', timelapse.getSnaplapseForSharedTour().getAsUrlString(tourJSON.keyframes));
  });

  controlReciever.on('sync decodeTour', function(tourURL) {
    var snaplapseForSharedTour = timelapse.getSnaplapseForSharedTour();
    var snaplapseViewerForSharedTour = snaplapseForSharedTour.getSnaplapseViewer();
    var match = tourURL.match(/(presentation)=([^#?&]*)/);
    var presentation = match[2];
    var tourJSON = JSON.parse(snaplapseForSharedTour.urlStringToJSON(presentation));
    var tourJSON = tourJSON.snaplapse;
    var settings = timelapse.getSettings();
    for (var i = 0; i < tourJSON.keyframes.length; i++) {
      var keyframe = tourJSON.keyframes[i];
      keyframe.centerView = timelapse.pixelBoundingBoxToLatLngCenterView(keyframe.bounds);
      keyframe.thumbnailURL = snaplapseViewerForSharedTour.generateThumbnailURL(settings["url"], keyframe.bounds, 260, 185, keyframe.time);
    }
    controlReciever.emit('returnDecodeTour', tourJSON);
  });

  controlReciever.on('sync mapViewUpdate', function(data) {
    var snaplapseForSharedTour = timelapse.getSnaplapseForSharedTour();
    if (snaplapseForSharedTour.isPlaying())
      snaplapseForSharedTour.stop();
    var formattedData = data.split(" ");
    var mapLatLng = {
      "lat": parseFloat(formattedData[0]),
      "lng": parseFloat(formattedData[1])
    };
    var movePoint = timelapse.getProjection().latlngToPoint(mapLatLng);
    movePoint.scale = timelapse.zoomToScale(parseFloat(formattedData[2]));
    // When we reach the map boundary, we warp instantly to the other side.
    if (Math.abs(mapLatLng.lng - previousMapLng) > 100)
      timelapse.warpTo(movePoint);
    else
      timelapse.setTargetView(movePoint);
    previousMapLng = mapLatLng.lng;
  });

  controlReciever.on('sync handlePlayPauseServer', function(data) {
    if (timelapse.isDoingLoopingDwell())
      controlReciever.emit('handlePlayPauseController', false);
    timelapse.handlePlayPause();
  });

  controlReciever.on('sync seekToFrame', function(desiredFrameNumber) {
    var currentFrameNumber = timelapse.getCurrentFrameNumber();
    if (desiredFrameNumber != currentFrameNumber)
      timelapse.seekToFrame(desiredFrameNumber);
  });

  controlReciever.on('sync setPlaybackRate', function(desiredPlaybackRate) {
    timelapse.setPlaybackRate(desiredPlaybackRate);
  });
}
