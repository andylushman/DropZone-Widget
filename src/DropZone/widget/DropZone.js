/*global logger*/
/*
    DropZone
    ========================

    @file      : DropZone.js
    @version   : 1.0.0
    @author    : Andy Lushman
    @date      : 12/4/2017
    @copyright : TimeSeries 2017
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "DropZone/lib/jquery-1.11.2",
    "dojo/text!DropZone/widget/template/DropZone.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("DropZone.widget.DropZone", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        //Listed as a reminder for data-dojo-attach-points. Not needed.
        phaseTitleNode: null,
        cardNode: null,

        // Parameters configured in the Modeler. Listed for a reminder not needed.
        phaseTitle: "",
        dataSourceMf: "",
        onDropMf: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
          _contextObj: null,


        /********************
         TEMPLATE FUNCTIONS
        ********************/

        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
        },

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate function");

            //Putting a string message into the dom
            dojoHtml.set(this.phaseTitleNode, this.phaseTitle);
        },

        //Needed to update this._contextObj so that its not null and therefore I can call a microflow in _execMf()
        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            callback();
            this._updateRendering();
        },

        _updateRendering: function() {
          this.runMf();
        },

        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (obj) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }

                        var divNum = this.class;

                        var htmlElements = "";
                        for (var i = 0; i < obj.length; i++) {
                          var project = obj[i]
                          var projectGuid = project.jsonData.guid;

                          var projectName = project.jsonData.attributes.Name.value;
                          var id = "'div" + divNum + [i] + "'";

                           htmlElements += "<div id=" + projectGuid + " class='project' draggable='true'>" + projectName + "</div>";

                           // this.projects.push(project);
                        };

                         // console.log(this.projects);

                        dojoHtml.set(this.projectNode, htmlElements);

                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        _execOnDropMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (obj) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }

                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        /********************
         OTHER FUNCTIONS
        ********************/

        //Trigger Microflow
        runMf: function(){
          //Trigger Data Scource Microflow if it's available
          if (this.dataSourceMf !== "") {
              this._execMf(this.dataSourceMf, this._contextObj.getGuid());
          }
        },


        //Find Guid
        // findGuid: function(){
        //   console.log("triggered findGuid");
        //   console.log(this.projectNode.innerHTML);
        // },

        //Drag and Drop Functions
        allowDrop: function(ev) {
          ev.preventDefault();
        },

        drag: function(ev) {
          ev.dataTransfer.setData("id", ev.target.id);
        },

        drop: function(ev) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("id");
            ev.target.appendChild(document.getElementById(data));

            var guid = ev.dataTransfer.getData("guid");
            console.log("Data id: " + data);

            //Trigger Data Scource Microflow if it's available
            this._execOnDropMf(this.onDropMf, data);
        }


    });
});

require(["DropZone/widget/DropZone"]);
