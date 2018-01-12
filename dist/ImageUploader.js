// Generated by CoffeeScript 2.1.1
// JavaScript auxiliary library
// Copyright (C) 2012 Dario Giovannetti <dev@dariogiovannetti.net>

// This file is part of JavaScript auxiliary library.

// JavaScript auxiliary library is free software: you can redistribute it
// and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3
// of the License, or (at your option) any later version.

// JavaScript auxiliary library is distributed in the hope that it will be
// useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with JavaScript auxiliary library.
// If not, see <http://www.gnu.org/licenses/>.
module.exports.ImageUploader = class ImageUploader {
  constructor() {
    this.total = 0;
    this.counter = 0;
    this.config = {
      'fileChooser': null, // Must be overridden
      'uploadButton': null, // Must be overridden
      'statusMessage': null, // Must be overridden
      'statusList': null, // Must be overridden
      'callBack': function() {},
      'copies': [
        {
          'processUrl': null, // Must be overridden
          'destPath': './', // Automatically normalized with a trailing slash
          'prefix': '',
          'type': 'image/png',
          'mode': 'deform',
          'width': 200,
          'height': 200
        }
      ]
    };
  }

  httpRequest(params) {
    var header, j, len, ref, req;
    // params = {
    //     method: ,
    //     url: ,
    //     data: ,
    //     headers: ,
    //     user: ,
    //     password: ,
    //     onload: ,
    //     onerror: ,
    //     onreadystatechange: ,
    // }
    if (params.method == null) {
      params.method = "GET";
    }
    if (params.data == null) {
      params.data = null;
    }
    if (params.headers == null) {
      params.headers = {};
    }
    if (params.user == null) {
      params.user = null;
    }
    if (params.password == null) {
      params.password = null;
    }
    if (params.onload == null) {
      params.onload = function(req) {};
    }
    if (params.onerror == null) {
      params.onerror = function(req) {};
    }
    if (params.onreadystatechange == null) {
      params.onreadystatechange = function(req) {};
    }
    params.async = true;
    req = new XMLHttpRequest();
    req.open(params.method, params.url, params.async, params.user, params.password);
    ref = params.headers;
    for (j = 0, len = ref.length; j < len; j++) {
      header = ref[j];
      req.setRequestHeader(header, params.headers[header]);
    }
    // TODO:
    //   http://www.matlus.com/html5-file-upload-with-progress/
    //   http://html5doctor.com/the-progress-element/
    //   http://www.geekthis.net/blog/38/html5-uploading-with-progress-bar
    req.upload.onprogress = function(e) {
      var percentComplete;
      if (e.lengthComputable) {
        return percentComplete = (e.loaded / e.total) * 100;
      }
    };
    // TODO: log
    //console.log(percentComplete + '% uploaded')
    req.onreadystatechange = function() {
      var err, response;
      response = {
        responseText: req.responseText,
        readyState: req.readyState,
        responseHeaders: req.getAllResponseHeaders(),
        status: req.status,
        statusText: req.statusText
      };
      try {
        response.responseJSON = JSON.parse(req.responseText);
      } catch (error) {
        err = error;
        response.responseJSON = void 0;
      }
      params.onreadystatechange(response);
      if (req.readyState === 4) {
        if (req.status === 200) {
          return params.onload(response);
        } else {
          return params.onerror(response);
        }
      }
    };
    req.send(params.data);
    return {
      abort: function() {
        return req.abort();
      }
    };
  }

  requestPost(params, blobs, url, call, callArgs) {
    var blob, err, j, k, len, len1, p, query;
    query = {
      method: "POST",
      url: url,
      onload: function(res) {
        return call(res, callArgs);
      },
      onerror: function(res) {
        if (confirm("Failed query (" + res.finalUrl + ")\n\nDo you want to retry?")) {
          return this.requestPost(params, url, call, callArgs);
        }
      }
    };
    query.data = new FormData();
    for (j = 0, len = params.length; j < len; j++) {
      p = params[j];
      query.data.append(p, params[p]);
    }
    for (k = 0, len1 = blobs.length; k < len1; k++) {
      blob = blobs[k];
      query.data.append(blob[0], blob[1], blob[2]);
    }
    try {
      // Do not add "multipart/form-data" explicitly or the query will fail
      //query.headers = {"Content-type": "multipart/form-data"}
      return this.httpRequest(query);
    } catch (error) {
      err = error;
      return alert("Failed HTTP request: " + err);
    }
  }

  dataURLtoBlob(cId, dataURL) {
    var array, binary, i, j, ref;
    // Thanks to http://mitgux.com/send-canvas-to-server-as-file-using-ajax
    binary = atob(dataURL.split(',')[1]);
    // Create 8-bit unsigned array
    array = [];
    for (i = j = 0, ref = binary.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: this.config.copies[cId].type
    });
  }

  processImage(iId, cId, canvas, name, image) {
    var ctx, imageObj, reader;
    ctx = canvas.getContext("2d");
    imageObj = new Image();
    imageObj.onload = function() {
      var modImage;
      this.resizeImage(cId, this, canvas, ctx);
      modImage = this.dataURLtoBlob(cId, canvas.toDataURL(this.config.copies[cId].type));
      return this.uploadImage(iId, cId, name, modImage);
    };
    reader = new FileReader();
    reader.onload = function(e) {
      return imageObj.src = e.target.result;
    };
    return reader.readAsDataURL(image);
  }

  resizeImage(cId, img, canvas, ctx) {
    var cfgHeight, cfgWidth, newHeight, newWidth, ratio;
    ratio = img.width / img.height;
    cfgWidth = this.config.copies[cId].width;
    cfgHeight = this.config.copies[cId].height;
    if (cfgWidth && cfgHeight) {
      newWidth = cfgWidth;
      newHeight = cfgHeight;
      if (this.config.copies[cId].mode === 'outside') {
        newHeight = cfgWidth / ratio;
        if (newHeight < cfgHeight) {
          newHeight = cfgHeight;
          newWidth = cfgHeight * ratio;
        }
      } else if (this.config.copies[cId].mode === 'inside') {
        newHeight = cfgWidth / ratio;
        if (newHeight > cfgHeight) {
          newHeight = cfgHeight;
          newWidth = cfgHeight * ratio;
        }
      }
    } else if (cfgWidth && !cfgHeight) {
      newWidth = cfgWidth;
      newHeight = cfgWidth / ratio;
    } else if (!cfgWidth && cfgHeight) {
      newWidth = cfgHeight * ratio;
      newHeight = cfgHeight;
    } else {
      newWidth = img.width;
      newHeight = img.height;
    }
    canvas.width = newWidth;
    canvas.height = newHeight;
    return ctx.drawImage(img, 0, 0, newWidth, newHeight);
  }

  uploadImage(iId, cId, name, blob) {
    var blobs, call, destPath, fName, url;
    destPath = this.config.copies[cId].destPath;
    if (destPath !== '' && destPath.substr(-1) !== '/') {
      destPath += '/';
    }
    fName = this.config.copies[cId].prefix + name;
    blobs = [['image', blob, fName]];
    url = this.config.copies[cId].processUrl;
    call = function(res, args) {
      this.updateStatus(iId, cId, res);
      if (this.counter === this.total) {
        return this.config.callBack();
      }
    };
    return this.requestPost({
      'destPath': destPath
    }, blobs, url, call, []);
  }

  updateStatus(iId, cId, res) {
    // @counter and @total are defined outside of this function
    this.counter++;
    this.config.statusMessage.innerHTML = (this.counter * 100 / this.total).toFixed(0) + " %";
    return this.config.statusList.getElementsByTagName('li')[iId].innerHTML += '<br>' + res.responseText;
  }

  configure(cfg) {
    var c, j, len, results;
    results = [];
    // cfg can be incomplete, thus using the default values in @config
    for (j = 0, len = cfg.length; j < len; j++) {
      c = cfg[j];
      results.push(this.config[c] = cfg[c]);
    }
    return results;
  }

  initStatus() {
    var files, image, imageItem, j, len, results;
    // Reset file list
    this.config.statusList.innerHTML = '';
    // Make sure the controls are enabled, as for example Firefox doesn't
    // re-enable them if the page is refreshed simply (not using Shift)
    this.config.uploadButton.disabled = false;
    this.config.fileChooser.disabled = false;
    files = this.config.fileChooser.files;
    results = [];
    for (j = 0, len = files.length; j < len; j++) {
      image = files[j];
      imageItem = document.createElement('li');
      imageItem.innerHTML = image.name + ' (' + image.type + ')';
      results.push(this.config.statusList.appendChild(imageItem));
    }
    return results;
  }

  main() {
    var c, canvas, files, i, image, j, ref, results;
    // Make sure the file list is up to date
    this.initStatus();
    // At the moment the page needs to be refreshed before doing another
    // upload, so leave the form disabled
    this.config.uploadButton.disabled = true;
    this.config.fileChooser.disabled = true;
    this.config.statusMessage.innerHTML = "0 %";
    canvas = document.createElement('canvas');
    files = this.config.fileChooser.files;
    // @total is defined outside of this function
    this.total = files.length * this.config.copies.length;
    results = [];
    for (i = j = 0, ref = files.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      image = files[i];
      results.push((function() {
        var k, ref1, results1;
        results1 = [];
        for (c = k = 0, ref1 = this.config.copies.length; 0 <= ref1 ? k < ref1 : k > ref1; c = 0 <= ref1 ? ++k : --k) {
          results1.push(this.processImage(i, c, canvas, image.name, image));
        }
        return results1;
      }).call(this));
    }
    return results;
  }

};
