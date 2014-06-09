console.log('initializing viewsync');

var MAX_TIME_DIFF = 1 / 60;
var MIN_SCALE = 0.05;

var yawOffset = (fields.yawOffset) ? fields.yawOffset : 0;
var pitchOffset = (fields.pitchOffset) ? fields.pitchOffset : 0;
var screensLeft = (fields.screensLeft) ? fields.screensLeft : 0;
var screensRight = (fields.screensRight) ? fields.screensRight : 0;
var screensUp = (fields.screensUp) ? fields.screensUp : 0;
var screensDown = (fields.screensDown) ? fields.screensDown : 0;
var viewsync = io.connect('/viewsync');
var masterView;

viewsync.on('connect', function() {
  console.log('viewsync connected');
  viewsync.emit('settings', {
    yawOffset: yawOffset,
    pitchOffset: pitchOffset
  });
});

viewsync.on('connect_failed', function() {
  console.log('viewsync connection failed!');
});

viewsync.on('disconnect', function() {
  console.log('viewsync disconnected');
});

function viewsync_init() {
  if (fields.master) {
    // events for master
    console.log('master of the universe');
    // wait for the timelapse to be ready, there must be a better way!
    var metadata = timelapse.getMetadata();
    masterView = timelapse.getView();
    timelapse.addViewChangeListener(function() {
      // correct scale extents before checking x/y
      var view = timelapse.getView();
      masterView = view;
      var bbox = timelapse.getBoundingBoxForCurrentView();
      var xmax = timelapse.getPanoWidth();
      var xmin = 0;
      var ymax = timelapse.getPanoHeight();
      var ymin = 0;
      var xyExtents = false;

      if (view.x < xmin) {
        view.x = xmin;
        xyExtents = true;
      } else if (view.x > xmax) {
        view.x = xmax;
        xyExtents = true;
      }
      if (view.y < ymin) {
        view.y = ymin;
        xyExtents = true;
      } else if (view.y > ymax) {
        view.y = ymax;
        xyExtents = true;
      }

      if (xyExtents) {
        timelapse.warpTo(view);
        bbox = timelapse.getBoundingBoxForCurrentView();
      }

      if (fields.showMap || fields.showControls)
        timelapse.updateLocationContextUI();

      viewsync.emit('view', {
        "bbox": bbox,
        "view": view
      });
    });

    timelapse.addTimeChangeListener(function() {
      viewsync_send_time(false);
    });

    timelapse.addVideoPlayListener(function() {
      console.log('master play');
      viewsync.emit('play', {
        play: true
      });
      viewsync_send_time(true);
    });

    timelapse.addVideoPauseListener(function() {
      console.log('master pause');
      viewsync.emit('play', {
        play: false
      });
      viewsync_send_time(true);
    });
  } else {
    // events for slaves
    viewsync.on('sync view', function(data) {
      masterView = data.view;
      var xoffset = (data.bbox.xmax - data.bbox.xmin) * yawOffset;
      var yoffset = (data.bbox.ymax - data.bbox.ymin) * pitchOffset;
      var bbox = {
        xmin: data.bbox.xmin + xoffset,
        xmax: data.bbox.xmax + xoffset,
        ymin: data.bbox.ymin + yoffset,
        ymax: data.bbox.ymax + yoffset
      };

      if (fields.showMap || fields.showControls)
        timelapse.updateLocationContextUI();

      timelapse.warpToBoundingBox(bbox);
    });

    viewsync.on('sync time', function(data) {
      timelapse.seek(data.time);
    });

    viewsync.on('sync play', function(data) {
      console.log('sync play: ' + data.play);
      if (data.play)
        timelapse.play();
      else
        timelapse.pause();
    });
  }
}

function viewsync_send_time(absolute) {
  var t = timelapse.getCurrentTime();
  viewsync.emit('time', {
    time: t,
    absolute: absolute
  });
}