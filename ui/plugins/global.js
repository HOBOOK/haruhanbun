import Vue from "vue";

const utils = {
  // 소수점2자리까지의 바이트 단위로 변환시키는 함수
  convertByteToString(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  convertByteNumber(bytes, decimals = 2) {
    if (bytes === 0) return "0";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  },

  convertByteSize(bytes) {
    if (bytes === 0) return "Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return sizes[i];
  },

  checkViewMode(level, vuetify) {
    let viewMode = ["xs", "sm", "md", "lg", "xl"];
    if (viewMode.slice(0, level).indexOf(vuetify.breakpoint.name) !== -1) {
      return false;
    } else {
      return true;
    }
  },

  btoa(content) {
    try {
      return window.btoa(content);
    } catch {
      this.btoaEscape(content);
    }
  },

  btoaEscape(content) {
    return window.btoa(
      encodeURIComponent(content).replace(
        /%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode("0x" + p1);
        }
      )
    );
  },

  // 이미지파일과 어노테이션 파일을 Zip으로 압축해서 다운받는 함수
  // async downloadDatasetZip(files, name){
  //     let zip = new JSZip()

  //     return new Promise((resolve, reject) => {
  //         for (let i = 0; i < files.length; i++) {
  //             let filename = files[i].filename
  //             let folder = files[i].folder
  //             zip.file(folder+"/"+filename, files[i].image,{ base64: true, createFolders: true })
  //             filename = filename.substring(0,filename.indexOf("."))
  //             zip.file(folder+"/"+filename + '.xml', atob(files[i].annotation))
  //         }
  //         zip.generateAsync({
  //             type: "blob"
  //         }).then((content) => {
  //             FileSaver.saveAs(content, name + "_dataset_" + Date.now() + ".zip")
  //             resolve()
  //         })
  //     })
  // },

  async downloadDatasetZip(dataset) {
    return new Promise((resolve, reject) => {
      let decodedZip = atob(dataset.zipBytes);
      let byteNumbers = new Array(decodedZip.length);

      for (let i = 0; i < decodedZip.length; i++) {
        byteNumbers[i] = decodedZip.charCodeAt(i);
      }

      let blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/zip",
      });
      FileSaver.saveAs(blob, dataset.id + ".zip");
      resolve();
    });
  },

  async downloadSourceData(files, annotationFiles, name, datasetInfo) {
    let zip = new JSZip();

    return new Promise((resolve, reject) => {
      for (let file of files) {
        let filename = file.filename;
        let folder = file.folder + "/";
        let annotation = file.annotation;

        zip.file("image/" + folder + filename, file.image, {
          base64: true,
          createFolders: true,
        });
        filename = filename.substring(0, filename.indexOf("."));

        if (
          datasetInfo.isSingleFormat &&
          datasetInfo.type !== "IMAGE_ONLY" &&
          annotation
        ) {
          zip.file(
            "annotation/" + folder + filename + datasetInfo.extension,
            this.decodefile(annotation)
          );
        }
      }

      if (!datasetInfo.isSingleFormat && annotationFiles) {
        for (let file2 of annotationFiles) {
          let annotationFolder = file2.folder;
          let annotation = file2.annotation;

          zip.file(
            "annotation/" + annotationFolder + datasetInfo.extension,
            this.decodefile(annotation)
          );
        }
      }

      zip
        .generateAsync({
          type: "blob",
        })
        .then((content) => {
          FileSaver.saveAs(content, name + "_dataset_" + Date.now() + ".zip");
          resolve();
        });
    });
  },

  padZero(num, digits) {
    let zero = "0";
    return String(num).padStart(digits, zero);
  },

  decodefile(file) {
    return decodeURIComponent(escape(atob(file)));
  },

  getSizeOfImageFile(file) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      let src = URL.createObjectURL(file);
      let size = {
        width: 0,
        height: 0,
      };
      img.src = src;
      img.onload = function () {
        size.width = this.width;
        size.height = this.height;
        resolve(size);
      };
      img.onerror = reject;
    });
  },

  getSizeOfImageSrc(src) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      let size = {
        width: 0,
        height: 0,
      };
      img.src = src;
      img.onload = function () {
        size.width = this.width;
        size.height = this.height;
        resolve(size);
      };
      img.onerror = () => {
        reject(size);
      };
    });
  },

  // 클립보드 저장 함수
  copy(val, callback = null) {
    if (val) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(val).then(() => {});
      } else {
        const t = document.createElement("textarea");
        document.body.appendChild(t);
        t.value = val;
        t.select();

        document.execCommand("copy");
        document.body.removeChild(t);
      }

      if (callback !== null) callback();
    }
  },

  isNumeric(num, opt) {
    // 좌우 trim(공백제거)을 해준다.
    num = String(num).replace(/^\s+|\s+$/g, "");

    if (typeof opt == "undefined" || opt == "1") {
      // 모든 10진수 (부호 선택, 자릿수구분기호 선택, 소수점 선택)
      var regex =
        /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == "2") {
      // 부호 미사용, 자릿수구분기호 선택, 소수점 선택
      var regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == "3") {
      // 부호 미사용, 자릿수구분기호 미사용, 소수점 선택
      var regex = /^[0-9]+(\.[0-9]+)?$/g;
    } else {
      // only 숫자만(부호 미사용, 자릿수구분기호 미사용, 소수점 미사용)
      var regex = /^[0-9]$/g;
    }

    if (regex.test(num)) {
      num = num.replace(/,/g, "");
      return isNaN(num) ? false : true;
    } else {
      return false;
    }
  },

  isPrivateIp(ip) {
    if (ip) {
      const parts = ip.split(".");
      const firstPart = parseInt(parts[0], 10);

      if (
        firstPart === 10 ||
        (firstPart === 192 && parseInt(parts[1], 10) === 168) ||
        (firstPart === 172 &&
          parseInt(parts[1], 10) >= 16 &&
          parseInt(parts[1], 10) <= 31)
      ) {
        return true;
      }
    }
    return false;
  },

  formatCardNumber(cardNumber) {
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
  },

  getIpAddress(url) {
    const match = url.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    return match ? match[0] : null;
  },

  getDomainName(url) {
    const match = url.match(/:\/\/(www[0-9]?|[a-zA-Z]\w*)\./);
    const startIndex = match.index + match[0].length - 1;
    const endIndex = startIndex + match[1].length;

    return url.slice(startIndex, endIndex);
  },

  generateUUID(prefix) {
    let uuid = "xxxxxxxx".replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    return (prefix ? prefix + "-" : "") + uuid;
  },

  getNestedValue(object, key) {
    const keys = key.split(".");
    return keys.reduce((o, k) => (o || {})[k], object);
  },

  toggleFullScreen(element) {
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) return element.requestFullscreen();
      if (element.webkitRequestFullscreen)
        return element.webkitRequestFullscreen();
      if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
      if (element.msRequestFullscreen) return element.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitCancelFullscreen)
        return document.webkitCancelFullscreen();
      if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
      if (document.msExitFullscreen) return document.msExitFullscreen();
    }
  },

  getRandomNumber(min, max, precision) {
    let random = Math.random() * (max - min) + min;
    return Number(random.toFixed(precision));
  },

  convertCsv(items) {
    let jsonArr = items;
    let keys = Object.keys(jsonArr[0]).filter((e) => e !== "_id");
    let result = keys.join(",") + "\n";

    jsonArr.forEach((obj) => {
      let arr = keys.map((key) => obj[key]);
      result += arr.join(",") + "\n";
    });

    return result;
  },

  downloadCsv(items, prefix = "") {
    if (!Array.isArray(items)) {
      console.warn("❌ items는 배열이 아닙니다.");
      return;
    }

    let jsonArr = items;
    let keys = Object.keys(jsonArr[0]).filter((e) => e !== "_id");
    let result = keys.join(",") + "\n";

    jsonArr.forEach((obj) => {
      let arr = keys.map((key) => obj[key]);
      result += arr.join(",") + "\n";
    });

    let blob = new Blob(["\uFEFF" + result], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;

    let filename = prefix ? prefix + "-" : "";

    filename += Date.now();

    filename += ".csv";
    a.download = filename;
    a.click();
  },

  dataURLToFile(dataURL, filename) {
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });

    return new File([blob], filename, { type: blob.type });
  },

  jsonToArray(item, depth) {
    if (depth === 0) return;
    let items = [];
    for (let k of Object.keys(item)) {
      let type = typeof item[k];
      if (type === "object") {
        type = Array.isArray(item[k]) ? "Array" : "Object";
      }

      if (item[k] && item[k].toString().length > 0) {
        let data = {
          name: k + ": " + (typeof item[k] === "object" ? type : item[k]),
          children:
            typeof item[k] === "object"
              ? this.jsonToArray(item[k], depth - 1)
              : [],
        };
        items.push(data);
      }
    }
    return items;
  },

  getTextWidth(text, font) {
    let canvas =
      this.getTextWidth.canvas ||
      (this.getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width + 24;
  },

  isDevelopmentMode() {
    return process.env.NODE_ENV === "development";
  },

  objectToTreeviewItems(obj, keyPrefix = "") {
    let items = [];

    Object.keys(obj).forEach((key, index) => {
      const id = `${keyPrefix}${key}-${index}`;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        items.push({
          id,
          name: key,
          children: Array.isArray(obj[key])
            ? obj[key].every(
                (item) => typeof item !== "object" && typeof item !== "array"
              )
              ? obj[key].map((item, idx) => ({
                  id: `${id}-${idx}`,
                  name: `${idx}: ${item}`,
                }))
              : obj[key].map((item, idx) =>
                  this.objectToTreeviewItems(item, `${id}-${idx}`).pop()
                )
            : this.objectToTreeviewItems(obj[key], id),
        });
      } else {
        items.push({
          id,
          name: `${key}: ${obj[key]}`,
        });
      }
    });

    return items;
  },

  validateJsonString(jsonString) {
    if (!jsonString) return false;
    let data;
    try {
      data = JSON.parse(jsonString);
      return true;
    } catch (error) {
      return false;
    }
  },

  convertToDotNotation(obj, parent = "", result = {}) {
    for (let [key, value] of Object.entries(obj)) {
      let newKey = parent ? `${parent}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        convertToDotNotation(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  },

  setNestedValue(obj, key, value) {
    const keys = key.split(".");
    let current = obj;

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  },
};

const regular = {
  basic(data) {
    let reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    return reg.test(data);
  },
  noBlank(data) {
    // 공백 없을 경우 true 반환
    let reg = /[\s]/g;
    return !reg.test(data);
  },
  passwordPatten(data) {
    //영문,숫자,특수문자(!@$%^&* 만 허용) 9 이상
    let reg =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{9,20}$/g;
    return reg.test(data);
  },
  emailPatten(data) {
    let reg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(data);
  },
  name(data) {
    let reg = /^[ㄱ-ㅎ가-힣a-zA-Z\s]+$/;
    return reg.test(data);
  },
  projName(data) {
    // 한글,영문,숫자,공백만 입력되었는지 TEST
    let reg = /^[ㄱ-ㅎ가-힣a-zA-Z0-9\s]+$/;
    return reg.test(data);
  },
  projDescription(data) {
    // 한글,영문,숫자,공백,특수문자, 이모지 입력되었는지 TEST
    let reg = /^[\s\p{L}\p{N}\p{P}\p{S}\p{Emoji_Presentation}]+$/u;
    return reg.test(data);
  },
  number(data) {
    let reg = /^[0-9]/;
    return reg.test(data);
  },
  phone(data) {
    let reg = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    return reg.test(data);
  },
  postalCode(data) {
    let reg = /^[0-9]{5}$/;
    return reg.test(data);
  },
};

const time = {
  formatTimestamp(timestamp, onlyTime = false) {
    if (!timestamp) return "";
    var date = new Date(timestamp);

    // Ensure dates and times are displayed as two digits
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var seconds = ("0" + date.getSeconds()).slice(-2);

    if (onlyTime) {
      return hours + ":" + minutes + ":" + seconds;
    }
    return (
      year +
      "." +
      month +
      "." +
      day +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds
    );
  },

  formatKoreanDate(isoString) {
    const date = new Date(isoString);

    const year = String(date.getFullYear()).slice(2); // '25'
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekDay}요일`;
  },

  isValidTimestamp(value) {
    if (!value) return false;
    const num = Number(value);
    if (!Number.isFinite(num)) return false;

    // 초 단위: 10자리, 밀리초 단위: 13자리
    if (num < 1000000000 || num > 9999999999999) return false;

    const date = new Date(num < 1e12 ? num * 1000 : num); // 초 → ms
    return !isNaN(date.getTime());
  },

  convertMillisecondsToTimeFormat(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
  },

  toLocalDateTimeString(dateString) {
    try {
      if (typeof dateString !== "string") {
        let date = new Date(
          dateString[0],
          dateString[1] - 1,
          dateString[2],
          dateString[3],
          dateString[4],
          dateString[5]
        );
        return date
          .toLocaleString()
          .substring(2, date.toLocaleString().lastIndexOf(":"));
      } else {
        let date = new Date(dateString);
        return date
          .toLocaleString()
          .substring(2, date.toLocaleString().lastIndexOf(":"));
      }
    } catch {
      return "";
    }
  },

  toLocalDateString(dateString) {
    try {
      let date;
      if (typeof dateString !== "string") {
        date = new Date(
          dateString[0],
          dateString[1] - 1,
          dateString[2],
          dateString[3],
          dateString[4],
          dateString[5]
        );
      } else {
        date = new Date(dateString);
      }

      const localeDateString = date.toLocaleString();
      return localeDateString.substring(0, localeDateString.lastIndexOf("."));
    } catch {
      return "";
    }
  },

  timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}초 전`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return `${diffInDays}일 전`;
    }
  },

  formatTimezoneOffset(offset) {
    const sign = offset >= 0 ? "+" : "-";
    const hours = String(Math.abs(offset)).padStart(2, "0");
    return `${sign}${hours}:00`;
  },
};

const colors = {
  colToHex(c) {
    let color = c < 75 ? c + 75 : c;
    let hex = color.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex(r, g, b) {
    return "#" + this.colToHex(r) + this.colToHex(g) + this.colToHex(b);
  },
  getRandomColor() {
    return this.rgbToHex(
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    );
  },
  getRandomColorByEmail(email) {
    return this.rgbToHex(
      Math.floor((email.length * email.length * email.charCodeAt(0)) % 255),
      Math.floor((email.length * email.length * email.charCodeAt(1)) % 255),
      Math.floor((email.length * email.length * email.charCodeAt(2)) % 255)
    );
  },
  getSplitColor(i) {
    if (i === 1 || i === "VALID") {
      return "#BBDEFB";
    } else if (i === 2 || i === "TEST") {
      return "#64B5F6";
    } else {
      return "#1E88E5";
    }
  },
};

const error = {
  getMessage(error, t) {
    if (error && error.response && error.response.data) {
      return error.response.data.message;
    } else {
      return t ? t("request_error_message") : "";
    }
  },
};

const tags = {
  generateHeader(items, headers) {
    let headerTagMap = {};

    for (let item of items) {
      if (item.tags) {
        for (let k of Object.keys(item.tags)) {
          if (
            !headerTagMap[k] &&
            headers.filter((e) => e.value === "tags." + k).length === 0
          ) {
            headers.push({
              text: k,
              value: "tags." + k,
              width: 160,
            });
            headerTagMap[k] = true;
          }
        }
      }
    }
  },
};

const robotUtils = {
  getThumbnailUrlBySerial(baseURL, serialNo, format = ".png") {
    return baseURL + "/resources/robots/images/" + serialNo + format;
  },

  getThumbnailUrl(baseURL, image) {
    return baseURL + "/resources/robots/images/" + image;
  },
};

const systemUtils = {
  setTheme($vuetify, $store, theme) {
    if ($vuetify.theme) {
      $store.commit("setTheme", theme);

      let darkMode = false;

      if (theme === "system") {
        darkMode =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        darkMode = theme === "dark";
      }
      $vuetify.theme.dark = darkMode;
    }
  },

  setLocale($i18n, $store, locale) {
    if ($i18n.locale) {
      $store.commit("setLocale", locale);
      $i18n.locale = $store.state.locale;
    }
  },
};

const fileUtils = {
  upload(axios, file, path) {
    return new Promise((resolve, reject) => {
      if (!file || !path) {
        reject();
        return;
      }

      const formData = new FormData();
      if (file) {
        formData.append("file", file);

        if (path[0] !== "/") {
          path = "/" + path;
        }

        axios
          .post("/resources" + path, formData)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  },

  getUrl(path) {
    let resourcePath = path;
    if (path && path[0] !== "/") {
      resourcePath = "/" + path;
    }
    return process.env.TWIN_SERVER_URL + "/resources" + resourcePath;
  },
};

Vue.prototype.$utils = utils;
Vue.prototype.$regular = regular;
Vue.prototype.$time = time;
Vue.prototype.$colors = colors;
Vue.prototype.$error = error;
Vue.prototype.$tags = tags;
Vue.prototype.$robotUtils = robotUtils;
Vue.prototype.$systemUtils = systemUtils;
Vue.prototype.$fileUtils = fileUtils;

export default ({ app }, inject) => {
  inject("utils", utils);
  inject("regular", regular);
  inject("time", time);
  inject("colors", colors);
  inject("error", error);
  inject("tags", tags);
  inject("robotUtils", robotUtils);
  inject("systemUtils", systemUtils);
  inject("fileUtils", fileUtils);
};
