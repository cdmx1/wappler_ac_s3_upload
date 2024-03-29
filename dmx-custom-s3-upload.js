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
    },
    methods: {
        abort: function () {
            this.abort()
        },
        reset: function () {
            this.reset()
        },
        select: function () {
            this.input.click()
        },
        upload: function () {
            this.upload()
        }
    },

    events: {
        start: Event,
        done: Event,
        error: Event,
        abort: Event,
        success: Event,
        upload: ProgressEvent
    },
    render: function (node) {
        if (this.$node) {
            this.$parse();
        }
    },
    render: function (t) {
        this.$node.addEventListener("dragover", this.onDragover.bind(this)), 
        this.$node.addEventListener("drop", this.onDrop.bind(this)), 
        this.$node.addEventListener("click", this.onClick.bind(this)), 
        this.input = document.createElement("input"), 
        this.input.type = "file", 
        this.input.accept = this.props.accept || "*/*", 
        this.input.addEventListener("change", 
        this.onChange.bind(this)), 
        this.xhr = new XMLHttpRequest, 
        this.xhr.addEventListener("abort", 
        this.onAbort.bind(this)), 
        this.xhr.addEventListener("error", 
        this.onError.bind(this)), 
        this.xhr.addEventListener("timeout", 
        this.onTimeout.bind(this)), 
        this.xhr.addEventListener("load", 
        this.onLoad.bind(this)), 
        this.xhr.upload.addEventListener("progress", this.onProgress.bind(this)), 
        this.$parse()
    },
    update: function (t) {
        this.props.accept != t.accept && (this.input.accept = this.props.accept || "*/*")
        // if(this.props.accept != t.accept) {
        //     this.updateFile(t)
        // }
    },
    onDragover: function (t) {
        t.stopPropagation(), t.preventDefault(), t.dataTransfer.dropEffect = 1 == t.dataTransfer.items.length ? "copy" : "none"
    },
    onDrop: function (t) {
        t.stopPropagation(), t.preventDefault(), 1 == t.dataTransfer.files.length && this.updateFile(t.dataTransfer.files[0])
    },
    onClick: function (t) {
        this.input.click()
    },
    onChange: function (t) {
        this.updateFile(t.target.files[0]), this.input.value = "", this.input.type = "", this.input.type = "file"
    },
    onAbort: function (t) {
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
        }), this.dispatchEvent("abort"), this.dispatchEvent("done")
    },
    onError: function (t) {
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
                message: t,
                response: null
            }
        }), console.error(t), this.dispatchEvent("error"), this.dispatchEvent("done")
    },
    onTimeout: function (t) {
        this.onError("Execution timeout")
    },
    onLoad: function (t) {
        this.xhr.status >= 400 ? this.onError(this.xhr.responseText) : (this.set({
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
        }), this.dispatchEvent("success"), this.dispatchEvent("done"))
    },
    onProgress: function (t) {
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
    validate: function (t, context) {
        var valElement = document.getElementById(`${this.$node.id}-val-msg`);
        var validationMessage = "";
        if (t.type.toLowerCase() === 'text/csv') {
            var reader = new FileReader();
            reader.onload = function (event) {
                var rows = event.target.result.split('\n');
                var numRows = rows.length - 1; // Subtract header
                if (numRows < 2) {
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
                })
                updateValidationMessage(validationMessage);
                }
                else if (numRows > context.props.csv_row_limit) {
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
                    })
                }
                updateValidationMessage(validationMessage);
            };
            reader.readAsText(t);
        } else {
            if (context.props.accept) {
                validationMessage = validateMimeType(t, context);
            }
            updateValidationMessage(validationMessage);
        }
    
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
        return !validationMessage;
    },
    updateFile: function (t) {
        if (this.validate(t, this)) {
            var e = {
                name: t.name,
                size: t.size,
                type: t.type,
                date: (t.lastModified ? new Date(t.lastModified) : t.lastModifiedDate).toISOString(),
                dataUrl: null
            }; - 1 === t.type.indexOf("image/") || t.reader || (t.reader = new FileReader, t.reader.onload = function (t) {
                e.dataUrl = t.target.result, dmx.requestUpdate()
            }.bind(this), t.reader.readAsDataURL(t)), this.file = t, this.set({
                file: e,
                state: {
                    idle: !1,
                    ready: !0,
                    uploading: !1,
                    done: !1
                }
            }), this.props.autoupload && this.upload()
        }
    },
    abort: function () {
        this.xhr.abort()
    },
    reset: function () {
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
    upload: function () {
        if (this.props.url) {
            this.set({
                state: {
                    idle: !1,
                    ready: !1,
                    uploading: !0,
                    done: !1
                }
            }), this.dispatchEvent("start");
            var t = new XMLHttpRequest;
            var formData = new FormData();
            formData.append('name', this.file.name);
            formData.append('file', this.file);

            t.onabort = this.onAbort.bind(this);
            t.onerror = this.onError.bind(this);
            t.open("POST", this.props.url);
            t.onload = function() {
                var valElement = document.getElementById(`${this.$node.id}-val-msg`);
                if (t.status === 200) {
                    valElement.style.display = "none";
                    var jsonResponse;
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
                        this.upload2(t);
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
                        return
                    }
                } else {
                    console.error("Failed to sign request. Status code: " + t.status);
                    this.set({
                        state: {
                            idle: !0,
                            ready: !1,
                            uploading: !1,
                            done: !1
                        }
                    });
                    if(t.status === 400) {
                        jsonResponse = JSON.parse(t.responseText);
                        valElement.innerText = jsonResponse.data.file;
                        valElement.style.color = "red";
                        valElement.style.display = "block";
                    }
                    return
                }
            }.bind(this);
            t.send(formData);
        } else this.onError("No url attribute is set")
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
            this.onError(t)
        }
    }
});