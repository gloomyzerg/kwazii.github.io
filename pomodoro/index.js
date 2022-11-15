$(function () {
  var working = 25 * 60;
  var short_break = 5 * 60;
  var long_break = 15 * 60;
  var remaining = working;
  var complete = 0;
  var pause = false;
  var start = false;
  var break_num = 0;
  var state = "stop";
  var tick = 1000;

  var state_zh_map = {
    pause: "暂停中",
    stop: "未开始",
    working: "工作中",
    short_break: "休息中",
    long_break: "长休息",
  };

  var main_zh_map = {
    pause: "继续",
    stop: "开始",
    working: "暂停",
    short_break: "结束",
    long_break: "结束",
  };

  var old_date_str = "";
  moment.locale("zh-cn");

  function padStart(value, len, pad) {
    if (value.length < len) {
      var need = len - value.length;
      for (var i = 0; i < need; i++) {
        value = pad + value;
      }
    }
    return value;
  }
  function timer() {
    if (remaining > 0) {
      remaining--;
    }
    refreshScreen();
    if (remaining <= 0) {
      next();
    }
  }
  function refreshScreen() {
    if (remaining < 0) {
      remaining = 0;
    }
    var minute = Math.floor(remaining / 60) + "";
    var second = (remaining % 60) + "";
    minute = padStart(minute, 2, "0");
    second = padStart(second, 2, "0");
    $(".minute").text(minute);
    $(".second").text(second);
  }
  function updateDate() {
    var now = moment();
    var date_str = now.tz("PRC").format("MM月DD日 dddd HH:mm");
    if (date_str != old_date_str) {
      old_date_str = date_str;
      $(".date").text(date_str);
    }
  }
  function updateState(state) {
    $(".operation .main").text(main_zh_map[state]);
    if (state == "pause") {
      $(".operation .reset").css("visibility", "visible");
    } else {
      $(".operation .reset").css("visibility", "hidden");
    }
    $(".info span:lt(" + complete + ")").addClass("complete");

    $(".state").text(state_zh_map[state]);
    if (state == "short_break" || state == "long_break") {
      $("body").addClass("dark");
    } else {
      $("body").removeClass("dark");
    }
    if (state == "stop") {
      refreshScreen();
    }
  }
  setInterval(function () {
    updateDate();
    if (start && !pause) {
      timer();
    }
  }, tick);

  $(".operation .main").click(function () {
    if (state == "stop") {
      doAction("start");
    } else if (state == "pause") {
      doAction("resume");
    } else if (state == "working") {
      doAction("pause");
    } else if (state == "short_break" || state == "long_break") {
      doAction("stop");
    }
  });
  $(".operation .reset").click(function () {
    doAction("reset");
  });

  function next() {
    if (state == "working") {
      if (break_num >= 3) {
        state = "long_break";
        break_num = 0;
      } else {
        state = "short_break";
        break_num++;
      }
      doAction("rest");
    } else {
      doAction("stop");
    }
  }
  function doAction(action) {
    switch (action) {
      case "rest":
        if (state == "short_break") {
          remaining = short_break;
        }
        if (state == "long_break") {
          remaining = long_break;
        }
        complete++;
        break;
      case "start":
        start = true;
        state = "working";
        remaining = working;
        break;
      case "stop":
        start = false;
        state = "stop";
        remaining = working;
        break;
      case "pause":
        pause = true;
        state = "pause";
        break;
      case "resume":
        pause = false;
        state = "working";
        break;
      case "reset":
        if (state != "pause") {
          return;
        }
        start = false;
        pause = false;
        state = "stop";
        remaining = working;
    }
    updateState(state);
  }
});
