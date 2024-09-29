dmx.Actions({
    "s3.custom-s3-upload": function (t) {
        var e = this.parse(t.input),
            i = this.parse(t.url),
            s = document.getElementById(e).files[0];
        return new Promise((function (t, e) {
            var n = new XMLHttpRequest;
            n.onerror = e, n.onabort = e, n.ontimeout = e, n.onload = t, n.open("PUT", i), n.setRequestHeader("Content-Type", s.type), n.send(s)
        }))
    }
  }),
    dmx.Component("custom-s3-upload", {
        initialData: {
            data: null,
            file: null,
            state: {
                idle: !0,
                ready: !1,
                uploading: !1,
                done: !1
            },
            uploadProgress: {
                position: 0,
                total: 0,
                percent: 0
            },
            lastError: {
                status: 0,
                message: "",
                response: null
            }
        },
        attributes: {
            url: {
                type: String,
                default: null
            },
            val_url: {
                type: String,
                default: null
            },
            prop: {
                type: String,
                default: "url"
            },
            accept: {
                type: String,
                default: null
            },
            accept_val_msg: {
                type: String,
                default: "Invalid file type."
            },
            file_size_limit: {
                type: Number,
                default: 2097152
            },
            autoupload: {
                type: Boolean,
                default: !1
            },
            csv_row_limit: {
                type: Number,
                default: 10
            },
            csv_no_records_val_msg: {
                type: String,
                default: "CSV has no records."
            },
            csv_limit_val_msg: {
                type: String,
                default: "CSV file exceeds row limit. Allowed limit 10"
            },
            val_resp_msg: {
                type: String,
                default: "Validation failed."
            },
            val_api_params: {
                type: Array,
                default: []
            },
            sign_api_params: {
                type: Array,
                default: []
            },
        },
        methods: {
            abort() {
                this.abort()
            },
            reset() {
                this.reset()
            },
            select() {
                this.input.click()
            },
            upload() {
                this.upload()
            }
        },
  
        events: {
            start: Event,
            done: Event,
            error: Event,
            invalid: Event,
            abort: Event,
            success: Event,
            upload: ProgressEvent
        },
        render(t) {
            this.$node.addEventListener("dragover",
                this.dragoverHandler),
                this.$node.addEventListener("drop", this.dropHandler),
                this.$node.addEventListener("click", this.clickHandler),
                this.input = document.createElement("input"),
                this.input.type = "file",
                this.input.accept = this.props.accept || "*/*",
                this.input.addEventListener("change",
                    this.changeHandler),
                this.$parse()
        },
        init() {
            this.abortHandler = this.abortHandler.bind(this),
                this.errorHandler = this.errorHandler.bind(this),
                this.timeoutHandler = this.timeoutHandler.bind(this),
                this.loadHandler = this.loadHandler.bind(this),
                this.progressHandler = this.progressHandler.bind(this),
                this.dragoverHandler = this.dragoverHandler.bind(this),
                this.dropHandler = this.dropHandler.bind(this),
                this.clickHandler = this.clickHandler.bind(this),
                this.changeHandler = this.changeHandler.bind(this),
                this.xhr = new XMLHttpRequest,
                this.xhr.addEventListener("abort", this.abortHandler),
                this.xhr.addEventListener("error", this.errorHandler),
                this.xhr.addEventListener("timeout", this.timeoutHandler),
                this.xhr.addEventListener("load", this.loadHandler),
                this.xhr.upload.addEventListener("progress",
                    this.progressHandler)
        },
        performUpdate(t) {
            t.has("accept") && (this.input.accept = this.props.accept || "*/*")
        },
        destroy() {
            this.xhr.removeEventListener("abort", this.abortHandler),
                this.xhr.removeEventListener("error", this.errorHandler),
                this.xhr.removeEventListener("timeout", this.timeoutHandler),
                this.xhr.removeEventListener("load", this.loadHandler),
                this.xhr.upload.removeEventListener("progress", this.progressHandler),
                this.$node.removeEventListener("dragover", this.dragoverHandler),
                this.$node.removeEventListener("drop", this.dropHandler),
                this.$node.removeEventListener("click", this.clickHandler),
                this.input.removeEventListener("change", this.changeHandler),
                this.xhr = null,
                this.input = null
        },
        validate: function (t, context) {
          return new Promise((resolve, reject) => {
              var valElement = document.getElementById(`${this.$node.id}-val-msg`);
              var validationMessage = "";
              const fileSizeLimit = context.props.file_size_limit;
      
              // Check file size
              if (t.size > fileSizeLimit) {
                  validationMessage = `File size exceeds the limit of ${fileSizeLimit / (1024 * 1024)}MB.`;
                  context.set({
                      data: null,
                      state: {
                        idle: !0,
                        ready: !1,
                        uploading: !1,
                        done: !1
                      },
                      uploadProgress: {
                          position: 0,
                          total: 0,
                          percent: 0
                      },
                      lastError: {
                          status: 0,
                          message: "file_size_exceeded",
                          response: null
                      }
                  });
                  updateValidationMessage(validationMessage);
                  return resolve(false);
              }
      
              let xhr = new XMLHttpRequest();
              let formData = new FormData();
              if (context.props.accept) {
                  validationMessage = validateMimeType(t, context);
                  if (validationMessage !== "") {
                      context.set({
                          data: null,
                          state: {
                              idle: true,
                              ready: false,
                              uploading: false,
                              done: false
                          },
                          uploadProgress: {
                              position: 0,
                              total: 0,
                              percent: 0
                          },
                          lastError: {
                              status: 0,
                              message: "invalid_file_type",
                              response: null
                          }
                      });
                      context.dispatchEvent("error");
                      updateValidationMessage(validationMessage);
                      return resolve(false);
                  }
              }
              formData.append('name', context.file.name);
              formData.append('file', context.file);
              formData.append('size', context.file.size);
              // Append additional parameters from this.props.val_api_params to formData
              this.props.val_api_params.forEach(function (param) {
                  formData.append(param.key, param.value);
              });
              xhr.onabort = context.abortHandler;
              xhr.onerror = context.errorHandler;
              xhr.open("POST", context.props.val_url);
              xhr.onload = function () {
                  let response = xhr.responseText;
                  if (xhr.status < 200 || xhr.status >= 300) {
                      context.set({
                          data: null,
                          state: {
                                idle: !0,
                                ready: !1,
                                uploading: !1,
                                done: !1
                          },
                          uploadProgress: {
                              position: 0,
                              total: 0,
                              percent: 0
                          },
                          lastError: {
                              status: xhr.status,
                              message: response,
                              response: JSON.parse(response)
                          }
                      });
                      dmx.nextTick(function () {
                          if (xhr.status === 400) {
                              this.dispatchEvent("invalid");
                          } else {
                              this.dispatchEvent("error");
                          }
                          validationMessage = context.props.val_resp_msg.replace(/^"(.*)"$/, '$1');
                          updateValidationMessage(validationMessage);
                      }, context);
                      return resolve(false);
                  } 
                  else {
                      if (t.type.toLowerCase() === 'text/csv') {
                          var reader = new FileReader();
                          reader.onload = function (event) {
                              var content = event.target.result.trim();
                            // Check if the file is empty
                              if (content.length === 0) {
                                  validationMessage = "CSV file is empty.";
                                  context.set({
                                      data: null,
                                      state: {
                                          idle: true,
                                          ready: false,
                                          uploading: false,
                                          done: false
                                      },
                                      uploadProgress: {
                                          position: 0,
                                          total: 0,
                                          percent: 0
                                      },
                                      lastError: {
                                          status: 0,
                                          message: "",
                                          response: null
                                      }
                                  });
                                  updateValidationMessage(validationMessage);
                                  return;
                            }
                            var rows = content.split('\n').map(row => row.trim());
                            var numRows = rows.length - 1; // Subtract header
                            if (numRows < 1) {
                                validationMessage = context.props.csv_no_records_val_msg;
                                context.set({
                                    data: null,
                                    state: {
                                        idle: !0,
                                        ready: !1,
                                        uploading: !1,
                                        done: !1
                                    },
                                    uploadProgress: {
                                        position: 0,
                                        total: 0,
                                        percent: 0
                                    },
                                    lastError: {
                                        status: 0,
                                        message: "",
                                        response: null
                                    }
                                });
                                updateValidationMessage(validationMessage);
                                return;
                            }
                            if (numRows > context.props.csv_row_limit) {
                                validationMessage = context.props.csv_limit_val_msg;
                                context.set({
                                    data: null,
                                    state: {
                                        idle: !0,
                                        ready: !1,
                                        uploading: !1,
                                        done: !1
                                    },
                                    uploadProgress: {
                                        position: 0,
                                        total: 0,
                                        percent: 0
                                    },
                                    lastError: {
                                        status: 0,
                                        message: "",
                                        response: null
                                    }
                                });
                                dmx.nextTick(function () {
                                    updateValidationMessage(validationMessage);
                                }, context);
                                return;
                            }
                            let headers = rows[0].split(',');
                            if (headers.length === 0) {
                                validationMessage = "CSV file is missing a header row.";
                                context.set({
                                    data: null,
                                    state: {
                                        idle: !0,
                                        ready: !1,
                                        uploading: !1,
                                        done: !1
                                    },
                                    uploadProgress: {
                                        position: 0,
                                        total: 0,
                                        percent: 0
                                    },
                                    lastError: {
                                        status: 0,
                                        message: "",
                                        response: null
                                    }
                                });
                                updateValidationMessage(validationMessage);
                                return;
                            }
                            let headerLength = headers.length;
                            let invalidRecordMessages = [];
                            let jsonData = [];
                            for (let i = 1; i < rows.length; i++) {
                                if (rows[i].length > 0) {
                                    let data = rows[i].split(',');
                                    // Check for mismatched quotes
                                    let quotesCount = (rows[i].match(/"/g) || []).length;
                                    if (quotesCount % 2 !== 0) {
                                        invalidRecordMessages.push(`Mismatched quotes on line ${i + 1}`);
                                    }
                                    // Check for invalid record length
                                    if (data.length !== headerLength) {
                                        invalidRecordMessages.push(`Invalid Record Length: columns length is ${headerLength}, got ${data.length} on line ${i + 1}`);
                                    }
                                    // Check for invalid characters
                                    if (/[^\x00-\x7F]+/.test(rows[i])) {
                                        invalidRecordMessages.push(`Invalid characters found on line ${i + 1}`);
                                    }
          
                                    let entry = {};
                                    for (let j = 0; j < headers.length; j++) {
                                        entry[headers[j]] = data[j];
                                    }
                                    // Schema validation
                                    let invalidRecords = {};
                                    if (val_csv_schema?.headers) {
                                        val_csv_schema.headers.forEach((headerConfig, index) => {
                                            let value = entry[headerConfig.name];
                                            let isConditionMet = headerConfig.condition ? headerConfig.condition(entry) : true;
                                            if (headerConfig.required && isConditionMet && (!value || value.trim() === '')) {
                                                const errorMessage = headerConfig.requiredError(headerConfig.name, i + 1, index + 1);
                                                if (!invalidRecords[i + 1]) {
                                                    invalidRecords[i + 1] = [];
                                                }
                                                invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                            }
                                            if (value) {
                                                if (headerConfig.validate && !headerConfig.validate(value)) {
                                                    const errorMessage = headerConfig.validateError(headerConfig.name, i + 1, index + 1);
                                                    if (!invalidRecords[i + 1]) {
                                                        invalidRecords[i + 1] = [];
                                                    }
                                                    invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                                }
                                                if (headerConfig.dependentValidate && !headerConfig.dependentValidate(value, entry)) {
                                                    const errorMessage = headerConfig.validateError(headerConfig.name, i + 1, index + 1);
                                                    if (!invalidRecords[i + 1]) {
                                                        invalidRecords[i + 1] = [];
                                                    }
                                                    invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                                }
                                            }
                                        });
                                    }
                                    // Output the errors in row-wise format
                                    Object.keys(invalidRecords).forEach(rowNumber => {
                                        invalidRecordMessages.push(`Row ${rowNumber}: ${invalidRecords[rowNumber].join(', ')}`);
                                    });
                                    jsonData.push(entry);
                                } else {
                                    invalidRecordMessages.push(`Empty row found on line ${i + 1}`);
                                    break;
                                }
                            }
                            invalidRecordMessage = invalidRecordMessages.join('\n\n');
                            if (invalidRecordMessage) {
                                context.set({
                                    data: null,
                                    state: {
                                        idle: !0,
                                        ready: !1,
                                        uploading: !1,
                                        done: !1
                                    },
                                    uploadProgress: {
                                        position: 0,
                                        total: 0,
                                        percent: 0
                                    },
                                    lastError: {
                                        status: 0,
                                        message: "",
                                        response: null
                                    }
                                });
                                updateValidationMessage(invalidRecordMessage);
                            } else {
                                context.set({
                                    data: {
                                        output: jsonData
                                    }
                                });
                                updateValidationMessage();
                            }
                          };
                          reader.readAsText(t);
                      }
                        else {
                            resolve(true);
                        }
                  }
              };
      
              xhr.send(formData);
      
              function validateMimeType(t, context) {
                  var acceptTypes = context.props.accept.split(/\s*,\s*/g);
                  for (var i = 0; i < acceptTypes.length; i++) {
                      var e = acceptTypes[i];
                      if ("." == e.charAt(0)) {
                          if (t.name.match(new RegExp("\\" + e + "$", "i"))) return "";
                      } else if (/(audio|video|image)\/\*/i.test(e)) {
                          if (t.type.match(new RegExp("^" + e.replace(/\*/g, ".*") + "$", "i"))) return "";
                      } else if (t.type.toLowerCase() == e.toLowerCase()) {
                          return "";
                      }
                  }
                  return context.props.accept_val_msg;
              }
      
              function updateValidationMessage(message) {
                  if (message) {
                      valElement.innerText = message;
                      valElement.style.color = "red";
                      valElement.style.display = "block";
                  } else {
                      valElement.innerText = "";
                      valElement.style.display = "none";
                  }
              }
          });
      },      
        updateFile(t) {
            dmx.nextTick(async function () {
                var e = {
                    name: t.name,
                    size: t.size,
                    type: t.type,
                    date: (t.lastModified ? new Date(t.lastModified) : t.lastModifiedDate).toISOString(),
                    dataUrl: null
            }; - 1 === t.type.indexOf("image/") || t.reader || (t.reader = new FileReader, t.reader.onload = t => {
                e.dataUrl = t.target.result, this.set("file", {
                    ...e
                })
            }, t.reader.readAsDataURL(t)), this.file = t, this.set({
                    file: e,
                    state: {
                        idle: !1,
                        ready: !0,
                        uploading: !1,
                        done: !1
                    }
                });
                // Validate and upload
                if (!(await this.validate(t, this))) {
                    return;
                }
                if (this.props.autoupload) {
                    this.upload();
                }
            }, this);
        },
        abort: function () {
            this.xhr.abort()
        },
        reset() {
            this.abort(), this.file = null, this.set({
                data: null,
                file: null,
                state: {
                    idle: !0,
                    ready: !1,
                    uploading: !1,
                    done: !1
                },
                uploadProgress: {
                    position: 0,
                    total: 0,
                    percent: 0
                },
                lastError: {
                    status: 0,
                    message: "",
                    response: null
                }
            })
        },
        upload() {
            if (!this.props.url) return void this.onError("No url attribute is set");
            this.set({
                state: {
                    idle: !1,
                    ready: !1,
                    uploading: !0,
                    done: !1
                }
            }), this.dispatchEvent("start");
            const t = new XMLHttpRequest;
            t.onabort = this.abortHandler, 
            t.onerror = this.errorHandler,
            t.open("POST", this.props.url);
            t.onload = function () {
                let jsonResponse;
                try {
                    jsonResponse = JSON.parse(t.responseText);
                } catch (error) {
                    console.error("Failed to parse JSON response:", error);
                }
                var valElement = document.getElementById(`${this.$node.id}-val-msg`);
                if (t.status === 200) {
                    valElement.style.display = "none";
                    try {
                        jsonResponse = JSON.parse(t.responseText);
                    } catch (error) {
                        console.error("Failed to parse JSON response:", error);
                        this.set({
                            state: {
                                idle: !0,
                                ready: !1,
                                uploading: !1,
                                done: !1
                            }
                        });
                        return;
                    }
                    if (jsonResponse && jsonResponse.url) {
                      this.file && this.upload2(t);
                    } else {
                        console.error("Response URL parameter missing.");
                        this.set({
                            state: {
                                idle: !0,
                                ready: !1,
                                uploading: !1,
                                done: !1
                            }
                        });
                        return;
                    }
                } else {
                    console.error("Failed to sign request. Status code: " + t.status);
                    this.set({
                        state: {
                            idle: !0,
                            ready: !1,
                            uploading: !1,
                            done: !1
                        },
                        lastError: {
                            status: t.status,
                            message: "",
                            response: jsonResponse
                        }
                    });
                    this.dispatchEvent("error")
                    if (t.status === 400) {
                        jsonResponse = JSON.parse(t.responseText);
                        valElement.innerText = jsonResponse.data.file;
                        valElement.style.color = "red";
                        valElement.style.display = "block";
                    }
                    return
                }
            }.bind(this);
            t.setRequestHeader("Content-Type", "application/json");
            var requestBody = {
                name: this.file.name
            };
            this.props.sign_api_params.forEach(function (param) {
                requestBody[param.key] = param.value;
            });
            t.send(JSON.stringify(requestBody));
        },
        upload2: function (t) {
            try {
                var e = JSON.parse(t.responseText),
                    i = e[this.props.prop];
                if (this.set("data", e), this.xhr.open("PUT", i), this.xhr.setRequestHeader("Content-Type", this.file.type), -1 != i.indexOf("x-amz-acl=")) {
                    var s = i.substr(i.indexOf("x-amz-acl=") + 10); - 1 != s.indexOf("&") && (s = s.substr(0, s.indexOf("&"))), this.xhr.setRequestHeader("x-amz-acl", s)
                }
                this.xhr.send(this.file)
            } catch (t) {
                this.errorHandler(t)
            }
        },
        abortHandler(t) {
            this.set({
                data: null,
                state: {
                    idle: !1,
                    ready: !0,
                    uploading: !1,
                    done: !1
                },
                uploadProgress: {
                    position: 0,
                    total: 0,
                    percent: 0
                }
            }), this.dispatchEvent("abort"),
                this.dispatchEvent("done")
        },
        errorHandler(t) {
            t instanceof ProgressEvent && (t = "Network error, perhaps no CORS set"), this.set({
                data: null,
                state: {
                    idle: !1,
                    ready: !0,
                    uploading: !1,
                    done: !1
                },
                uploadProgress: {
                    position: 0,
                    total: 0,
                    percent: 0
                },
                lastError: {
                    status: 0,
                    message: t.message || t,
                    response: null
                }
            }), console.error(t),
                this.dispatchEvent("error"),
                this.dispatchEvent("done")
        },
        timeoutHandler(t) {
            this.errorHandler("Execution timeout")
        },
        loadHandler(t) {
            this.xhr.status >= 400 ? this.errorHandler(this.xhr.responseText) : (this.set({
                state: {
                    idle: !1,
                    ready: !1,
                    uploading: !1,
                    done: !0
                },
                uploadProgress: {
                    position: this.file.size,
                    total: this.file.size,
                    percent: 100
                }
            }), this.dispatchEvent("success"),
                this.dispatchEvent("done"))
        },
        progressHandler(t) {
            this.set({
                state: {
                    idle: !1,
                    ready: !1,
                    uploading: !0,
                    done: !1
                },
                uploadProgress: {
                    position: t.loaded,
                    total: this.file.size,
                    percent: Math.ceil(t.loaded / t.total * 100)
                }
            }), this.dispatchEvent("upload", {
                lengthComputable: t.lengthComputable,
                loaded: t.loaded,
                total: t.total
            })
        },
        dragoverHandler(t) {
            t.stopPropagation(),
                t.preventDefault(),
                t.dataTransfer.dropEffect = 1 == t.dataTransfer.items.length ? "copy" : "none"
        },
        dropHandler(t) {
            t.stopPropagation(),
                t.preventDefault(), 1 == t.dataTransfer.files.length && this.updateFile(t.dataTransfer.files[0])
        },
        clickHandler(t) {
            this.input.click()
        },
        changeHandler(t) {
            this.updateFile(t.target.files[0]),
                this.input.value = "",
                this.input.type = "",
                this.input.type = "file"
        }
    }),
    dmx.Component("custom-s3-upload-multi", {
        initialData: {
            data: null,
            files: [],
            state: {
                idle: !0,
                ready: !1,
                uploading: !1
            },
            lastError: ""
        },
        attributes: {
            url: {
                type: String,
                default: null
            },
            prop: {
                type: String,
                default: "url"
            },
            accept: {
                type: String,
                default: null
            },
            autoupload: {
                type: Boolean,
                default: !1
            },
            thumbs: {
                type: String,
                default: "true"
            },
            thumbWidth: {
                type: Number,
                default: 100
            },
            thumbHeight: {
                type: Number,
                default: 100
            }
        },
        methods: {
            abort() {
                this.abort()
            },
            reset() {
                this.reset()
            },
            select() {
                this.input.click()
            },
            remove(t) {
                this.remove(t)
            },
            upload() {
                this.startUpload()
            }
        },
        events: {
            start: Event,
            done: Event,
            error: Event,
            abort: Event,
            success: Event
        },
        render(t) {
            this.$node.addEventListener("dragover", this.onDragover.bind(this)), this.$node.addEventListener("drop", this.onDrop.bind(this)), this.$node.addEventListener("click", this.onClick.bind(this)), this.input = document.createElement("input"), this.input.type = "file", this.input.multiple = !0, this.input.accept = this.props.accept || "*/*", this.input.addEventListener("change", this.onChange.bind(this)), this.maxRetries = 5, this.uploads = [], this.ii = 0, this.$parse()
        },
        performUpdate(t) {
            t.has("accept") && (this.input.accept = this.props.accept || "*/*")
        },
        isUploading() {
            return !!this.uploads.find((function (t) {
                return t.info.uploading
            }), this)
        },
        nextRetry(t) {
            return 3e3 * (this.maxRetries - t + 1)
        },
        _updateData() {
            this.set("files", [...this.data.files]), this.uploads.length ? this.isUploading() ? this.set("state", {
                idle: !1,
                ready: !1,
                uploading: !0
            }) : this.set("state", {
                idle: !1,
                ready: !0,
                uploading: !1
            }) : this.set("state", {
                idle: !0,
                ready: !1,
                uploading: !1
            })
        },
        validate: function (t, context) {
            return new Promise((resolve, reject) => {
                var valElement = document.getElementById(`${this.$node.id}-val-msg`);
                var validationMessage = "";
                const fileSizeLimit = context.props.file_size_limit;
        
                // Check file size
                if (t.size > fileSizeLimit) {
                    validationMessage = `File size exceeds the limit of ${fileSizeLimit / (1024 * 1024)}MB.`;
                    context.set({
                        data: null,
                        state: {
                          idle: !0,
                          ready: !1,
                          uploading: !1,
                          done: !1
                        },
                        uploadProgress: {
                            position: 0,
                            total: 0,
                            percent: 0
                        },
                        lastError: {
                            status: 0,
                            message: "file_size_exceeded",
                            response: null
                        }
                    });
                    updateValidationMessage(validationMessage);
                    return resolve(false);
                }
        
                let xhr = new XMLHttpRequest();
                let formData = new FormData();
                if (context.props.accept) {
                    validationMessage = validateMimeType(t, context);
                    if (validationMessage !== "") {
                        context.set({
                            data: null,
                            state: {
                                idle: true,
                                ready: false,
                                uploading: false,
                                done: false
                            },
                            uploadProgress: {
                                position: 0,
                                total: 0,
                                percent: 0
                            },
                            lastError: {
                                status: 0,
                                message: "invalid_file_type",
                                response: null
                            }
                        });
                        context.dispatchEvent("error");
                        updateValidationMessage(validationMessage);
                        return resolve(false);
                    }
                }
                formData.append('name', context.file.name);
                formData.append('file', context.file);
                formData.append('size', context.file.size);
                // Append additional parameters from this.props.val_api_params to formData
                this.props.val_api_params.forEach(function (param) {
                    formData.append(param.key, param.value);
                });
                xhr.onabort = context.abortHandler;
                xhr.onerror = context.errorHandler;
                xhr.open("POST", context.props.val_url);
                xhr.onload = function () {
                    let response = xhr.responseText;
                    if (xhr.status < 200 || xhr.status >= 300) {
                        context.set({
                            data: null,
                            state: {
                                  idle: !0,
                                  ready: !1,
                                  uploading: !1,
                                  done: !1
                            },
                            uploadProgress: {
                                position: 0,
                                total: 0,
                                percent: 0
                            },
                            lastError: {
                                status: xhr.status,
                                message: response,
                                response: JSON.parse(response)
                            }
                        });
                        dmx.nextTick(function () {
                            if (xhr.status === 400) {
                                this.dispatchEvent("invalid");
                            } else {
                                this.dispatchEvent("error");
                            }
                            validationMessage = context.props.val_resp_msg.replace(/^"(.*)"$/, '$1');
                            updateValidationMessage(validationMessage);
                        }, context);
                        return resolve(false);
                    } 
                    else {
                        if (t.type.toLowerCase() === 'text/csv') {
                            var reader = new FileReader();
                            reader.onload = function (event) {
                                var content = event.target.result.trim();
                              // Check if the file is empty
                                if (content.length === 0) {
                                    validationMessage = "CSV file is empty.";
                                    context.set({
                                        data: null,
                                        state: {
                                            idle: true,
                                            ready: false,
                                            uploading: false,
                                            done: false
                                        },
                                        uploadProgress: {
                                            position: 0,
                                            total: 0,
                                            percent: 0
                                        },
                                        lastError: {
                                            status: 0,
                                            message: "",
                                            response: null
                                        }
                                    });
                                    updateValidationMessage(validationMessage);
                                    return;
                              }
                              var rows = content.split('\n').map(row => row.trim());
                              var numRows = rows.length - 1; // Subtract header
                              if (numRows < 1) {
                                  validationMessage = context.props.csv_no_records_val_msg;
                                  context.set({
                                      data: null,
                                      state: {
                                          idle: !0,
                                          ready: !1,
                                          uploading: !1,
                                          done: !1
                                      },
                                      uploadProgress: {
                                          position: 0,
                                          total: 0,
                                          percent: 0
                                      },
                                      lastError: {
                                          status: 0,
                                          message: "",
                                          response: null
                                      }
                                  });
                                  updateValidationMessage(validationMessage);
                                  return;
                              }
                              if (numRows > context.props.csv_row_limit) {
                                  validationMessage = context.props.csv_limit_val_msg;
                                  context.set({
                                      data: null,
                                      state: {
                                          idle: !0,
                                          ready: !1,
                                          uploading: !1,
                                          done: !1
                                      },
                                      uploadProgress: {
                                          position: 0,
                                          total: 0,
                                          percent: 0
                                      },
                                      lastError: {
                                          status: 0,
                                          message: "",
                                          response: null
                                      }
                                  });
                                  dmx.nextTick(function () {
                                      updateValidationMessage(validationMessage);
                                  }, context);
                                  return;
                              }
                              let headers = rows[0].split(',');
                              if (headers.length === 0) {
                                  validationMessage = "CSV file is missing a header row.";
                                  context.set({
                                      data: null,
                                      state: {
                                          idle: !0,
                                          ready: !1,
                                          uploading: !1,
                                          done: !1
                                      },
                                      uploadProgress: {
                                          position: 0,
                                          total: 0,
                                          percent: 0
                                      },
                                      lastError: {
                                          status: 0,
                                          message: "",
                                          response: null
                                      }
                                  });
                                  updateValidationMessage(validationMessage);
                                  return;
                              }
                              let headerLength = headers.length;
                              let invalidRecordMessages = [];
                              let jsonData = [];
                              for (let i = 1; i < rows.length; i++) {
                                  if (rows[i].length > 0) {
                                      let data = rows[i].split(',');
                                      // Check for mismatched quotes
                                      let quotesCount = (rows[i].match(/"/g) || []).length;
                                      if (quotesCount % 2 !== 0) {
                                          invalidRecordMessages.push(`Mismatched quotes on line ${i + 1}`);
                                      }
                                      // Check for invalid record length
                                      if (data.length !== headerLength) {
                                          invalidRecordMessages.push(`Invalid Record Length: columns length is ${headerLength}, got ${data.length} on line ${i + 1}`);
                                      }
                                      // Check for invalid characters
                                      if (/[^\x00-\x7F]+/.test(rows[i])) {
                                          invalidRecordMessages.push(`Invalid characters found on line ${i + 1}`);
                                      }
            
                                      let entry = {};
                                      for (let j = 0; j < headers.length; j++) {
                                          entry[headers[j]] = data[j];
                                      }
                                      // Schema validation
                                      let invalidRecords = {};
                                      if (val_csv_schema?.headers) {
                                          val_csv_schema.headers.forEach((headerConfig, index) => {
                                              let value = entry[headerConfig.name];
                                              let isConditionMet = headerConfig.condition ? headerConfig.condition(entry) : true;
                                              if (headerConfig.required && isConditionMet && (!value || value.trim() === '')) {
                                                  const errorMessage = headerConfig.requiredError(headerConfig.name, i + 1, index + 1);
                                                  if (!invalidRecords[i + 1]) {
                                                      invalidRecords[i + 1] = [];
                                                  }
                                                  invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                              }
                                              if (value) {
                                                  if (headerConfig.validate && !headerConfig.validate(value)) {
                                                      const errorMessage = headerConfig.validateError(headerConfig.name, i + 1, index + 1);
                                                      if (!invalidRecords[i + 1]) {
                                                          invalidRecords[i + 1] = [];
                                                      }
                                                      invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                                  }
                                                  if (headerConfig.dependentValidate && !headerConfig.dependentValidate(value, entry)) {
                                                      const errorMessage = headerConfig.validateError(headerConfig.name, i + 1, index + 1);
                                                      if (!invalidRecords[i + 1]) {
                                                          invalidRecords[i + 1] = [];
                                                      }
                                                      invalidRecords[i + 1].push(`C${index + 1} [${errorMessage}]`);
                                                  }
                                              }
                                          });
                                      }
                                      // Output the errors in row-wise format
                                      Object.keys(invalidRecords).forEach(rowNumber => {
                                          invalidRecordMessages.push(`Row ${rowNumber}: ${invalidRecords[rowNumber].join(', ')}`);
                                      });
                                      jsonData.push(entry);
                                  } else {
                                      invalidRecordMessages.push(`Empty row found on line ${i + 1}`);
                                      break;
                                  }
                              }
                              invalidRecordMessage = invalidRecordMessages.join('\n\n');
                              if (invalidRecordMessage) {
                                  context.set({
                                      data: null,
                                      state: {
                                          idle: !0,
                                          ready: !1,
                                          uploading: !1,
                                          done: !1
                                      },
                                      uploadProgress: {
                                          position: 0,
                                          total: 0,
                                          percent: 0
                                      },
                                      lastError: {
                                          status: 0,
                                          message: "",
                                          response: null
                                      }
                                  });
                                  updateValidationMessage(invalidRecordMessage);
                              } else {
                                  context.set({
                                      data: {
                                          output: jsonData
                                      }
                                  });
                                  updateValidationMessage();
                              }
                            };
                            reader.readAsText(t);
                        }
                          else {
                              resolve(true);
                          }
                    }
                };
        
                xhr.send(formData);
        
                function validateMimeType(t, context) {
                    var acceptTypes = context.props.accept.split(/\s*,\s*/g);
                    for (var i = 0; i < acceptTypes.length; i++) {
                        var e = acceptTypes[i];
                        if ("." == e.charAt(0)) {
                            if (t.name.match(new RegExp("\\" + e + "$", "i"))) return "";
                        } else if (/(audio|video|image)\/\*/i.test(e)) {
                            if (t.type.match(new RegExp("^" + e.replace(/\*/g, ".*") + "$", "i"))) return "";
                        } else if (t.type.toLowerCase() == e.toLowerCase()) {
                            return "";
                        }
                    }
                    return context.props.accept_val_msg;
                }
        
                function updateValidationMessage(message) {
                    if (message) {
                        valElement.innerText = message;
                        valElement.style.color = "red";
                        valElement.style.display = "block";
                    } else {
                        valElement.innerText = "";
                        valElement.style.display = "none";
                    }
                }
            });
        },  
        onDragover(t) {
            t.stopPropagation(), t.preventDefault(), t.dataTransfer.dropEffect = "copy"
        },
        onDrop(t) {
            if (t.stopPropagation(), t.preventDefault(), t.dataTransfer) {
                var e = t.dataTransfer.files;
                if (e.length) {
                    var i = t.dataTransfer.items;
                    i && i.length && i[0].webkitGetAsEntry ? this.updateFilesFromItems(i) : this.updateFiles(e)
                }
            }
        },
        onClick(t) {
            this.input.click()
        },
        onChange(t) {
            this.updateFiles(t.target.files), this.input.value = "", this.input.type = "", this.input.type = "file"
        },
        onAbort(t, e) {
            t.info.uploading = !1, t.info.uploaded = 0, t.info.percent = 0, this._updateData(), this.isUploading() || (this.dispatchEvent("abort"), this.dispatchEvent("done"))
        },
        onError(t, e) {
            t.url && t.retries ? setTimeout(this.upload3.bind(this, t), this.nextRetry(t.retries--)) : (e = e instanceof ProgressEvent ? "Network error, perhaps no CORS set" : e.message || e, this.set("lastError", e), t.info.uploading = !1, t.info.uploaded = 0, t.info.percent = 0, t.info.error = e, this._updateData(), this.isUploading() || (this.dispatchEvent("error"), this.dispatchEvent("done")))
        },
        onTimeout(t, e) {
            this.onError(t, "Execution timeout")
        },
        onLoad(t, e) {
            t.xhr.status >= 500 || 429 == t.xhr.status ? t.retries ? setTimeout(this.upload3.bind(this, t), this.nextRetry(t.retries--)) : this.onError(t, t.xhr.responseText || t.xhr.statusText) : t.xhr.status >= 400 ? this.onError(t, t.xhr.responseText || t.xhr.statusText) : (this.remove(t.file.id), this._updateData(), this.isUploading() || (this.uploads.length ? this.dispatchEvent("error") : this.dispatchEvent("success"), this.dispatchEvent("done")))
        },
        onProgress(t, e) {
            t.info.uploaded = e.loaded, t.info.percent = e.lengthComputable ? Math.ceil(e.loaded / e.total * 100) : 0, this._updateData()
        },
        resize(t, e) {
            var i = document.createElement("img"),
                s = parseInt(this.props["thumb-width"]) || 100,
                r = parseInt(this.props["thumb-height"]) || 100;
            i.onload = function () {
                var t = document.createElement("canvas"),
                    a = t.getContext("2d"),
                    n = i.width,
                    o = i.height;
                s = Math.min(s, n), r = Math.min(r, o);
                var d = s / r;
                (n > s || o > r) && (n / o > d ? n = o * d : o = n / d), t.width = s, t.height = r;
                var l = (i.width - n) / 2,
                    h = (i.height - o) / 2;
                a.drawImage(i, l, h, n, o, 0, 0, s, r), e(t.toDataURL())
            }, i.src = t
        },
        async updateFile(t) {
            if (await this.validate(t, this)) {
                t.id = ++this.ii;
                var e = {
                    id: t.id,
                    name: t.name,
                    size: t.size,
                    type: t.type,
                    date: (t.lastModified ? new Date(t.lastModified) : t.lastModifiedDate).toISOString(),
                    data: null,
                    uploading: !1,
                    uploaded: 0,
                    percent: 0,
                    ready: !1,
                    error: null,
                    dataUrl: null
                }; - 1 === t.type.indexOf("image/") || t.reader ? e.ready = !0 : (t.reader = new FileReader, t.reader.onload = t => {
                    e.dataUrl = t.target.result, this.props.thumbs ? this.resize(e.dataUrl, (function (t) {
                        e.dataUrl = t, e.ready = !0, this.set("files", [...this.data.files])
                    })) : e.ready = !0, this._updateData()
                }, t.reader.readAsDataURL(t));
                var i = {
                    retries: this.maxRetries,
                    info: e,
                    file: t,
                    xhr: null
                };
                this.uploads.push(i), this.set({
                    files: this.data.files.concat([e]),
                    state: {
                        idle: !1,
                        ready: !0,
                        uploading: !1,
                        done: !1
                    }
                }), this.props.autoupload && (this.isUploading() || this.dispatchEvent("start"), this.upload(i))
            }
        },
        updateFiles(t) {
            dmx.array(t).forEach((function (t) {
                this.updateFile(t)
            }), this)
        },
        updateFilesFromItems(t) {
            dmx.array(t).forEach((function (t) {
                var e;
                t.webkitGetAsEntry && (e = t.webkitGetAsEntry()) ? e.isFile ? this.updateFile(t.getAsFile()) : e.isDirectory && this.updateFilesFromDirectory(e) : t.getAsFile && (t.kind && "file" != t.kind || this.updateFile(t.getAsFile()))
            }), this)
        },
        updateFilesFromDirectory(t, e) {
            var i = t.createReader(),
                s = function () {
                    i.readEntries(function (t) {
                        t.length && t.forEach((function (t) {
                            t.isFile ? t.file(function (t) {
                                t.fullPath = e + "/" + t.name, this.updateFile(t)
                            }.bind(this)) : t.isDirectory && this.updateFilesFromDirectory(t, e + "/" + t.name)
                        }), this), s()
                    }.bind(this), function (t) {
                        console.warn(t)
                    }.bind(this))
                }.bind(this);
            s()
        },
        abort() {
            this.uploads.forEach((function (t) {
                t.xhr && t.xhr.abort()
            }))
        },
        reset() {
            this.abort(), this.uploads = [], this.set({
                data: null,
                files: [],
                state: {
                    idle: !0,
                    ready: !1,
                    uploading: !1
                },
                lastError: ""
            })
        },
        remove(t) {
            var e = this.uploads.findIndex((function (e) {
                return e.file.id == t
            })); - 1 != e && (this.uploads[e].xhr && this.uploads[e].xhr.abort(), this.uploads.splice(e, 1), this.data.files.splice(e, 1), this._updateData())
        },
        startUpload() {
            this.dispatchEvent("start"), this.uploads.forEach((function (t) {
                this.upload(t)
            }), this)
        },
        upload(t) {
            t.info && t.info.uploading || (this.props.url ? (this.set({
                state: {
                    idle: !1,
                    ready: !1,
                    uploading: !0,
                    done: !1
                }
            }), t.info.uploading = !0, this.set("files", [...this.data.files]), t.xhr = new XMLHttpRequest, t.xhr.onabort = this.onAbort.bind(this, t), t.xhr.onerror = this.onError.bind(this, t), t.xhr.ontimeout = this.onTimeout.bind(this, t), t.xhr.onload = this.upload2.bind(this, t), t.xhr.open("GET", this.props.url + "?name=" + encodeURIComponent(t.file.name)), t.xhr.send()) : this.onError("No url attribute is set"))
        },
        upload2(t) {
            try {
                t.info.data = JSON.parse(t.xhr.responseText), t.url = t.info.data[this.props.prop], t.xhr.onload = this.onLoad.bind(this, t), t.xhr.upload.addEventListener("progress", this.onProgress.bind(this, t)), this.upload3(t)
            } catch (e) {
                this.onError(t, e)
            }
        },
        upload3(t) {
            try {
                if (t.xhr.open("PUT", t.url), t.xhr.setRequestHeader("Content-Type", t.file.type), -1 != t.url.indexOf("x-amz-acl=")) {
                    var e = t.url.substr(t.url.indexOf("x-amz-acl=") + 10); - 1 != e.indexOf("&") && (e = e.substr(0, e.indexOf("&"))), t.xhr.setRequestHeader("x-amz-acl", e)
                }
                t.xhr.send(t.file)
            } catch (e) {
                t.retries ? (console.log("Retry upload", t), setTimeout(this.upload3.bind(this, t), this.nextRetry(t.retries--))) : (console.log("Error in upload", t, e), this.onError(t, e))
            }
        }
    });
