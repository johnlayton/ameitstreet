/*
 Copyright (c) 2012, Smartrak, Jacob Toye
 Leaflet.draw is an open-source JavaScript library for drawing shapes/markers on leaflet powered maps.
 https://github.com/jacobtoye/Leaflet.draw
*/
(function(){L.drawVersion="0.1.4",L.Util.extend(L.LineUtil,{segmentsIntersect:function(t,e,i,o){return this._checkCounterclockwise(t,i,o)!==this._checkCounterclockwise(e,i,o)&&this._checkCounterclockwise(t,e,i)!==this._checkCounterclockwise(t,e,o)},_checkCounterclockwise:function(t,e,i){return(i.y-t.y)*(e.x-t.x)>(e.y-t.y)*(i.x-t.x)}}),L.Polyline.include({intersects:function(){var t,e,i,o=this._originalPoints,n=o?o.length:0;if(this._tooFewPointsForIntersection())return!1;for(t=n-1;t>=3;t--)if(e=o[t-1],i=o[t],this._lineSegmentsIntersectsRange(e,i,t-2))return!0;return!1},newLatLngIntersects:function(t,e){return this._map?this.newPointIntersects(this._map.latLngToLayerPoint(t),e):!1},newPointIntersects:function(t,e){var i=this._originalPoints,o=i?i.length:0,n=i?i[o-1]:null,s=o-2;return this._tooFewPointsForIntersection(1)?!1:this._lineSegmentsIntersectsRange(n,t,s,e?1:0)},_tooFewPointsForIntersection:function(t){var e=this._originalPoints,i=e?e.length:0;return i+=t||0,!this._originalPoints||3>=i},_lineSegmentsIntersectsRange:function(t,e,i,o){var n,s,a=this._originalPoints;o=o||0;for(var r=i;r>o;r--)if(n=a[r-1],s=a[r],L.LineUtil.segmentsIntersect(t,e,n,s))return!0;return!1}}),L.Polygon.include({intersects:function(){var t,e,i,o,n,s=this._originalPoints;return this._tooFewPointsForIntersection()?!1:(t=L.Polyline.prototype.intersects.call(this))?!0:(e=s.length,i=s[0],o=s[e-1],n=e-2,this._lineSegmentsIntersectsRange(o,i,n,1))}}),L.Tooltip=L.Class.extend({initialize:function(t){this._map=t,this._popupPane=t._panes.popupPane,this._container=L.DomUtil.create("div","leaflet-draw-tooltip",this._popupPane),this._singleLineLabel=!1},dispose:function(){this._popupPane.removeChild(this._container),this._container=null},updateContent:function(t){return t.subtext=t.subtext||"",0!==t.subtext.length||this._singleLineLabel?t.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!1):(L.DomUtil.addClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!0),this._container.innerHTML=(t.subtext.length>0?'<span class="leaflet-draw-tooltip-subtext">'+t.subtext+"</span>"+"<br />":"")+"<span>"+t.text+"</span>",this},updatePosition:function(t){var e=this._map.latLngToLayerPoint(t);return L.DomUtil.setPosition(this._container,e),this},showAsError:function(){return L.DomUtil.addClass(this._container,"leaflet-error-draw-tooltip"),L.DomUtil.addClass(this._container,"leaflet-flash-anim"),this},removeError:function(){return L.DomUtil.removeClass(this._container,"leaflet-error-draw-tooltip"),L.DomUtil.removeClass(this._container,"leaflet-flash-anim"),this}}),L.Control.Toolbar=L.Control.extend({initialize:function(t){L.Util.extend(this.options,t),this._modes={}},_initModeHandler:function(t,e,i,o){var n=t.type;this._modes[n]={},this._modes[n].handler=t,this._modes[n].button=this._createButton({title:t.options.title,className:o+"-"+(t.options.style?t.options.style:n),container:e,callback:this._modes[n].handler.enable,context:this._modes[n].handler}),this._modes[n].buttonIndex=i,this._modes[n].handler.on("enabled",this._handlerActivated,this).on("disabled",this._handlerDeactivated,this)},_createButton:function(t){var e=L.DomUtil.create("a",t.className||"",t.container);return e.href="#",t.text&&(e.innerHTML=t.text),t.title&&(e.title=t.title),L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"mousedown",L.DomEvent.stopPropagation).on(e,"dblclick",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",t.callback,t.context),e},_handlerActivated:function(t){this._activeMode&&this._activeMode.handler.enabled()&&this._activeMode.handler.disable(),this._activeMode=this._modes[t.handler],L.DomUtil.addClass(this._activeMode.button,"leaflet-control-toolbar-button-enabled"),this._showActionsToolbar()},_handlerDeactivated:function(){this._hideActionsToolbar(),L.DomUtil.removeClass(this._activeMode.button,"leaflet-control-toolbar-button-enabled"),this._activeMode=null},_createActions:function(t){for(var e,i=L.DomUtil.create("ul","leaflet-control-toolbar-actions"),o=50,n=t.length,s=n*o+(n-1),a=0;n>a;a++)e=L.DomUtil.create("li","",i),this._createButton({title:t[a].title,text:t[a].text,container:e,callback:t[a].callback,context:t[a].context});return i.style.width=s+"px",i},_showActionsToolbar:function(){var t=this._activeMode.buttonIndex,e=this._lastButtonIndex,i=25,o=1,n=3+t*i+t*o;this._actionsContainer.style.top=n+"px",0===t&&L.DomUtil.addClass(this._toolbarContainer,"leaflet-control-toolbar-actions-top"),t===e&&L.DomUtil.addClass(this._toolbarContainer,"leaflet-control-toolbar-actions-bottom"),this._actionsContainer.style.display="block"},_hideActionsToolbar:function(){this._actionsContainer.style.display="none",L.DomUtil.removeClass(this._toolbarContainer,"leaflet-control-toolbar-actions-top"),L.DomUtil.removeClass(this._toolbarContainer,"leaflet-control-toolbar-actions-bottom")}}),L.Map.mergeOptions({drawControl:!1}),L.Control.Draw=L.Control.Toolbar.extend({options:{position:"topleft",shapes:[{name:"polyline",type:"polyline",style:"polyline",title:"Draw a polyline"},{name:"polygon",type:"polygon",style:"polygon",title:"Draw a polygon"},{name:"rectangle",type:"rectangle",style:"rectangle",title:"Draw a rectangle"},{name:"circle",type:"circle",style:"circle",title:"Draw a circle"},{name:"marker",type:"marker",style:"marker",title:"Add a marker"}]},onAdd:function(t){var e,i=L.DomUtil.create("div",""),o=0;this._toolbarContainer=L.DomUtil.create("div","leaflet-control-toolbar"),this.handlers={};for(var n=0;this.options.shapes.length>n;n++){var s=this.options.shapes[n];if("polyline"===s.type)e=new L.Draw.Polyline(t,s);else if("polygon"===s.type)e=new L.Draw.Polygon(t,s);else if("rectangle"===s.type)e=new L.Draw.Rectangle(t,s);else if("circle"===s.type)e=new L.Draw.Circle(t,s);else{if("marker"!==s.type)continue;e=new L.Draw.Marker(t,s)}this._initModeHandler(e,this._toolbarContainer,o++,"leaflet-control-draw")}return this._lastButtonIndex=--o,this._actionsContainer=this._createActions([{title:"Cancel drawing",text:"Cancel",callback:this._cancel,context:this}]),i.appendChild(this._toolbarContainer),i.appendChild(this._actionsContainer),i},_cancel:function(){this._activeMode.handler.disable()}}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))}),L.Draw={},L.Draw.Feature=L.Handler.extend({includes:L.Mixin.Events,initialize:function(t,e){this._map=t,this._container=t._container,this._overlayPane=t._panes.overlayPane,this._popupPane=t._panes.popupPane,e&&e.shapeOptions&&(e.shapeOptions=L.Util.extend({},this.options.shapeOptions,e.shapeOptions)),L.Util.extend(this.options,e)},enable:function(){this.fire("enabled",{handler:this.type}),this._map.fire("draw:enabled",{drawingType:this.type}),L.Handler.prototype.enable.call(this)},disable:function(){this.fire("disabled",{handler:this.type}),this._map.fire("draw:disabled",{drawingType:this.type}),L.Handler.prototype.disable.call(this)},addHooks:function(){this._map&&(L.DomUtil.disableTextSelection(),this._tooltip=new L.Tooltip(this._map),L.DomEvent.addListener(this._container,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._tooltip.dispose(),this._tooltip=null,L.DomEvent.removeListener(this._container,"keyup",this._cancelDrawing))},_cancelDrawing:function(t){27===t.keyCode&&this.disable()}}),L.SimpleShape={},L.Draw.SimpleShape=L.Draw.Feature.extend({addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._map.dragging.disable(),this._container.style.cursor="crosshair",this._tooltip.updateContent({text:this._initialLabelText}),this._map.on("mousedown",this._onMouseDown,this).on("mousemove",this._onMouseMove,this),L.Browser.touch&&L.DomEvent.addListener(this._container,"touchstart",this._onMouseDown,this).addListener(document,"touchmove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._map.dragging.enable(),this._container.style.cursor="",this._map.off("mousedown",this._onMouseDown,this).off("mousemove",this._onMouseMove,this),L.DomEvent.off(document,"mouseup",this._onMouseUp),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchstart",this._onMouseDown).removeListener(document,"touchmove",this._onMouseMove).removeListener(document,"touchend",this._onMouseUp),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_onMouseDown:function(t){this._isDrawing=!0,this._tooltip.updateContent({text:"Release mouse to finish drawing."});var e=t.latlng;e||(e=this._map.mouseEventToLatLng(t.touches?t.touches[0]:t)),this._startLatLng=e,t.touches&&L.DomEvent.stopPropagation(t),L.DomEvent.addListener(document,"mouseup",this._onMouseUp,this).preventDefault(t),L.Browser.touch&&L.DomEvent.addListener(document,"touchend",this._onMouseUp,this)},_onMouseMove:function(t){var e=t.latlng;e||(e=this._map.mouseEventToLatLng(t.touches?t.touches[0]:t)),t.touches&&L.DomEvent.stopPropagation(t),this._tooltip.updatePosition(e),this._isDrawing&&(this._tooltip.updateContent({text:"Release mouse to finish drawing."}),this._drawShape(e))},_onMouseUp:function(t){this._endLatLng=this._map.mouseEventToLatLng(t.changedTouches?t.changedTouches[0]:t),t.touches&&L.DomEvent.stopPropagation(t),this._shape&&this._fireCreatedEvent(),this.disable()}}),L.Draw.Polyline=L.Draw.Feature.extend({statics:{TYPE:"polyline"},Poly:L.Polyline,options:{name:"polyline",allowIntersection:!0,drawError:{color:"#b00b00",message:"<strong>Error:</strong> shape edges cannot cross!",timeout:2500},icon:new L.DivIcon({iconSize:L.Browser.touch?new L.Point(20,20):new L.Point(10,10),className:"leaflet-div-icon leaflet-editing-icon"}),guidelineDistance:20,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0},touchtarget:1.5,zIndexOffset:2e3},initialize:function(t,e){e&&e.drawError&&(e.drawError=L.Util.extend({},this.options.drawError,e.drawError)),this.type=L.Draw.Polyline.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._tooltip.updateContent(this._getTooltipText()),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this).on("zoomend",this._onZoomEnd,this),L.Browser.touch&&L.DomEvent.addListener(this._container,"touchmove",this._onMouseMove,this).addListener(this._container,"touchend",this._onClick,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._clearHideErrorTimeout(),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._mouseMarker.off("click",this._onClick),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._clearGuides(),this._map.off("mousemove",this._onMouseMove).off("zoomend",this._onZoomEnd),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchmove",this._onMouseMove).removeListener(this._container,"touchend",this._onClick)},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[0],!0);return!this.options.allowIntersection&&t||!this._shapeIsValid()?(this._showErrorTooltip(),undefined):(this._map.fire("draw:polyline-created",{poly:new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions)}),this.disable(),undefined)},_shapeIsValid:function(){return!0},_onZoomEnd:function(){this._updateGuide()},_onMouseMove:function(t){var e=t.layerPoint,i=t.latlng;this._markers.length,i||(i=this._map.mouseEventToLatLng(t.changedTouches[0])),this._currentLatLng=i,this._tooltip.updatePosition(i),this._updateGuide(e),this._mouseMarker.setLatLng(i),L.DomEvent.preventDefault(t)},_onClick:function(t){var e=t.latlng;if(e||(e=t.changedTouches?this._map.mouseEventToLatLng(t.changedTouches[0]):t.target.getLatLng()),(t.changedTouches||t.touches)&&(this._clearGuides(),this._clickedFinishMarker(e)))return this._finishShape(),!0;var i=this._markers.length;return i>0&&!this.options.allowIntersection&&this._poly.newLatLngIntersects(e)?(this._showErrorTooltip(),undefined):(this._errorShown&&this._hideErrorTooltip(),this._markers.push(this._createMarker(e)),this._poly.addLatLng(e),2===this._poly.getLatLngs().length&&this._map.addLayer(this._poly),this._updateMarkerHandler(),this._vertexAdded(e),this._clearGuides(),undefined)},_clickedFinishMarker:function(t){if(this._markers.length>1){var e=this._markers[this._markers.length-1],i=this._map.latLngToContainerPoint(t),o=this._map.latLngToContainerPoint(e.getLatLng()),n=Math.floor(Math.sqrt(Math.pow(o.x-i.x,2)+Math.pow(o.y-i.y,2))),s=e.options.icon.options.iconSize;if(Math.max(s.x,s.y)*this.options.touchtarget>n)return!0}return!1},_updateMarkerHandler:function(){this._markers.length>1&&(this._markers[this._markers.length-1].on("click",this._finishShape,this),L.Browser.touch&&(this._markers[this._markers.length-1].on("touchmove",this._finishShape,this),this._markers[this._markers.length-1].on("touchstart",this._finishShape,this),this._markers[this._markers.length-1].on("touchend",this._finishShape,this))),this._markers.length>2&&(this._markers[this._markers.length-2].off("click",this._finishShape),L.Browser.touch&&(this._markers[this._markers.length-2].off("touchend",this._finishShape),this._markers[this._markers.length-2].on("touchmove",this._finishShape),this._markers[this._markers.length-2].on("touchstart",this._finishShape)))},_createMarker:function(t){var e=new L.Marker(t,{icon:this.options.icon,zIndexOffset:2*this.options.zIndexOffset});return this._markerGroup.addLayer(e),e},_updateGuide:function(t){t=t||this._map.latLngToLayerPoint(this._currentLatLng);var e=this._markers.length;e>0&&(this._errorShown||this._tooltip.updateContent(this._getTooltipText()),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[e-1].getLatLng()),t))},_drawGuide:function(t,e){var i,o,n,s,a=Math.floor(Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2)));for(this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._overlayPane)),i=this.options.guidelineDistance;a>i;i+=this.options.guidelineDistance)o=i/a,n={x:Math.floor(t.x*(1-o)+o*e.x),y:Math.floor(t.y*(1-o)+o*e.y)},s=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),s.style.backgroundColor=this._errorShown?this.options.drawError.color:this.options.shapeOptions.color,L.DomUtil.setPosition(s,n)},_updateGuideColor:function(t){if(this._guidesContainer)for(var e=0,i=this._guidesContainer.childNodes.length;i>e;e++)this._guidesContainer.childNodes[e].style.backgroundColor=t},_clearGuides:function(){if(this._guidesContainer)for(;this._guidesContainer.firstChild;)this._guidesContainer.removeChild(this._guidesContainer.firstChild)},_getTooltipText:function(){var t,e,i;return 0===this._markers.length?t={text:"Click to start drawing line."}:(e=this._measurementRunningTotal+this._currentLatLng.distanceTo(this._markers[this._markers.length-1].getLatLng()),i=e>1e3?(e/1e3).toFixed(2)+" km":Math.ceil(e)+" m",t=1===this._markers.length?{text:"Click to continue drawing line.",subtext:i}:{text:"Click last point to finish line.",subtext:i}),t},_showErrorTooltip:function(){this._errorShown=!0,this._tooltip.showAsError().updateContent({text:this.options.drawError.message}),this._updateGuideColor(this.options.drawError.color),this._poly.setStyle({color:this.options.drawError.color}),this._clearHideErrorTimeout(),this._hideErrorTimeout=setTimeout(L.Util.bind(this._hideErrorTooltip,this),this.options.drawError.timeout)},_hideErrorTooltip:function(){this._errorShown=!1,this._clearHideErrorTimeout(),this._tooltip.removeError().updateContent(this._getTooltipText()),this._updateGuideColor(this.options.shapeOptions.color),this._poly.setStyle({color:this.options.shapeOptions.color})},_clearHideErrorTimeout:function(){this._hideErrorTimeout&&(clearTimeout(this._hideErrorTimeout),this._hideErrorTimeout=null)},_vertexAdded:function(t){1===this._markers.length?this._measurementRunningTotal=0:this._measurementRunningTotal+=t.distanceTo(this._markers[this._markers.length-2].getLatLng())},_cleanUpShape:function(){this._markers.length>0&&this._markers[this._markers.length-1].off("click",this._finishShape)}}),L.Draw.Polygon=L.Draw.Polyline.extend({statics:{TYPE:"polygon"},Poly:L.Polygon,options:{name:"polygon",shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){L.Draw.Polyline.prototype.initialize.call(this,t,e),this.type=L.Draw.Polygon.TYPE},_updateMarkerHandler:function(){1===this._markers.length&&this._markers[0].on("click",this._finishShape,this)},_getTooltipText:function(){var t;return t=0===this._markers.length?"Click to start drawing shape.":3>this._markers.length?"Click to continue drawing shape.":"Click first point to close this shape.",{text:t}},_shapeIsValid:function(){return this._markers.length>=3},_vertexAdded:function(){},_cleanUpShape:function(){this._markers.length>0&&this._markers[0].off("click",this._finishShape)},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[0],!0);return!this.options.allowIntersection&&t||!this._shapeIsValid()?(this._showErrorTooltip(),undefined):(this._map.fire("draw:polygon-created",{poly:new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions)}),this.disable(),undefined)}}),L.Draw.Circle=L.Draw.SimpleShape.extend({statics:{TYPE:"circle"},options:{name:"circle",shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Circle.TYPE,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_initialLabelText:(L.Browser.touch?"Tap":"Click")+" and drag to draw circle.",_drawShape:function(t){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(t)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){this._map.fire("draw:circle-created",{circ:new L.Circle(this._startLatLng,this._shape.getRadius(),this.options.shapeOptions)})}}),L.Draw.Rectangle=L.Draw.SimpleShape.extend({statics:{TYPE:"rectangle"},options:{name:"rectangle",shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Rectangle.TYPE,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_initialLabelText:"Click and drag to draw rectangle.",_drawShape:function(t){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,t)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){this._map.fire("draw:rectangle-created",{rect:new L.Rectangle(this._shape.getBounds(),this.options.shapeOptions)})}}),L.Draw.Marker=L.Draw.Feature.extend({statics:{TYPE:"marker"},options:{name:"marker",icon:new L.Icon.Default,zIndexOffset:2e3},initialize:function(t,e){this.type=L.Draw.Marker.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._tooltip.updateContent({text:"Click map to place marker."}),this._map.on("mousemove",this._onMouseMove,this),L.Browser.touch&&(L.DomEvent.addListener(this._container,"touchstart",this._onMouseMove,this),L.DomEvent.addListener(this._container,"touchmove",this._onMouseMove,this)))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._marker&&(this._marker.off("click",this._onClick),this._map.off("click",this._onClick).removeLayer(this._marker),delete this._marker),this._map.off("mousemove",this._onMouseMove),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchend",this._onClick).removeListener(this._container,"touchstart",this._onMouseMove).removeListener(this._container,"touchmove",this._onMouseMove))},_onMouseMove:function(t){var e=t.latlng;!e&&t.changedTouches&&(e=this._map.mouseEventToLatLng(t.changedTouches[0])),this._tooltip.updatePosition(e),this._marker?this._marker.setLatLng(e):(this._marker=new L.Marker(e,{icon:this.options.icon,zIndexOffset:this.options.zIndexOffset}),this._marker.on("click",this._onClick,this),this._map.on("click",this._onClick,this).addLayer(this._marker),L.Browser.touch&&L.DomEvent.addListener(this._container,"touchend",this._onClick,this))},_onClick:function(){this._map.fire("draw:marker-created",{marker:new L.Marker(this._marker.getLatLng(),{icon:this.options.icon})}),this.disable()}}),L.Control.Edit=L.Control.Toolbar.extend({options:{position:"topleft",edit:{title:"Edit layers"},remove:{title:"Delete layers"},featureGroup:null,selectedPathOptions:null},initialize:function(t){L.Control.Toolbar.prototype.initialize.call(this,t),this._selectedFeatureCount=0},onAdd:function(t){var e=L.DomUtil.create("div",""),i=0;return this._toolbarContainer=L.DomUtil.create("div","leaflet-control-toolbar"),this._map=t,this.options.edit&&this._initModeHandler(new L.Edit.Feature(t,{featureGroup:this.options.featureGroup,selectedPathOptions:this.options.selectedPathOptions}),this._toolbarContainer,i++,"leaflet-control-edit"),this.options.remove&&this._initModeHandler(new L.Delete.Feature(t,{featureGroup:this.options.featureGroup}),this._toolbarContainer,i++,"leaflet-control-edit"),this._lastButtonIndex=--i,this._actionsContainer=this._createActions([{title:"Save changes.",text:"Save",callback:this._save,context:this},{title:"Cancel editing, discards all changes.",text:"Cancel",callback:this._cancel,context:this}]),e.appendChild(this._toolbarContainer),e.appendChild(this._actionsContainer),e},_cancel:function(){this._activeMode.handler.revertLayers(),this._activeMode.handler.disable()},_save:function(){this._activeMode.handler.disable()},_showCancelButton:function(){L.Control.Toolbar.prototype._showCancelButton.call(this)}}),L.Delete=L.Delete||{},L.Delete.Feature=L.Handler.extend({statics:{TYPE:"remove"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.Util.setOptions(this,e),this._deletableLayers=this.options.featureGroup,!(this._deletableLayers instanceof L.FeatureGroup))throw Error("options.featureGroup must be a L.FeatureGroup");this.type=L.Delete.Feature.TYPE},enable:function(){L.Handler.prototype.enable.call(this),this._deletableLayers.on("layeradd",this._enableLayerDelete,this).on("layerremove",this._disableLayerDelete,this),this.fire("enabled",{handler:this.type})},disable:function(){L.Handler.prototype.disable.call(this),this._deletableLayers.off("layeradd",this._enableLayerDelete).off("layerremove",this._disableLayerDelete),this.fire("disabled",{handler:this.type})},addHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._enableLayerDelete,this),this._deletedLayers=new L.layerGroup,this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:"Click on a feature to remove."}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._disableLayerDelete,this),this._deletedLayers=null,this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove))},revertLayers:function(){this._deletedLayers.eachLayer(function(t){this._deletableLayers.addLayer(t)},this)},_enableLayerDelete:function(t){var e=t.layer||t.target||t;e.on("click",this._removeLayer,this)},_disableLayerDelete:function(t){var e=t.layer||t.target||t;e.off("click",this._removeLayer),this._deletedLayers.removeLayer(e)},_removeLayer:function(t){var e=t.layer||t.target||t;this._deletableLayers.removeLayer(e),this._deletedLayers.addLayer(e)},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)}}),L.Edit=L.Edit||{},L.Edit.Feature=L.Handler.extend({statics:{TYPE:"edit"},includes:L.Mixin.Events,options:{selectedPathOptions:{color:"#fe57a1",opacity:.6,dashArray:"10, 10",fill:!0,fillColor:"#fe57a1",fillOpacity:.1}},initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),e.selectedPathOptions=e.selectedPathOptions||this.options.selectedPathOptions,L.Util.setOptions(this,e),this._featureGroup=this.options.featureGroup,!(this._featureGroup instanceof L.FeatureGroup))throw Error("options.featureGroup must be a L.FeatureGroup");this._uneditedLayerProps={},this.type=L.Edit.Feature.TYPE},enable:function(){L.Handler.prototype.enable.call(this),this._featureGroup.on("layeradd",this._enableLayerEdit,this).on("layerremove",this._disableLayerEdit,this),this.fire("enabled",{handler:this.type})},disable:function(){this.fire("disabled",{handler:this.type}),this._featureGroup.off("layeradd",this._enableLayerEdit).off("layerremove",this._disableLayerEdit),L.Handler.prototype.disable.call(this)},addHooks:function(){this._map&&(this._featureGroup.eachLayer(this._enableLayerEdit,this),this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:"Drag handles, or marker to edit feature.",subtext:"Click cancel to undo changes."}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._featureGroup.eachLayer(this._disableLayerEdit,this),this._uneditedLayerProps={},this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove))},revertLayers:function(){this._featureGroup.eachLayer(function(t){this._revertLayer(t)},this)},_backupLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps[e]||(this._uneditedLayerProps[e]=t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?{latlngs:this._cloneLatLngs(t.getLatLngs())}:t instanceof L.Circle?{latlng:this._cloneLatLng(t.getLatLng()),radius:t.getRadius()}:{latlng:this._cloneLatLng(t.getLatLng())})},_revertLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps.hasOwnProperty(e)&&(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?t.setLatLngs(this._uneditedLayerProps[e].latlngs):t instanceof L.Circle?(t.setLatLng(this._uneditedLayerProps[e].latlng),t.setRadius(this._uneditedLayerProps[e].radius)):t.setLatLng(this._uneditedLayerProps[e].latlng))},_toggleMarkerHighlight:function(t){var e=t._icon;e.style.display="none",L.DomUtil.hasClass(e,"leaflet-edit-marker-selected")?(L.DomUtil.removeClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,-4)):(L.DomUtil.addClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,4)),e.style.display=""},_offsetMarker:function(t,e){var i=parseInt(t.style.marginTop,10)-e,o=parseInt(t.style.marginLeft,10)-e;t.style.marginTop=i+"px",t.style.marginLeft=o+"px"},_enableLayerEdit:function(t){var e=t.layer||t.target||t,i=L.Util.extend({},this.options.selectedPathOptions);this._backupLayer(e),e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.options.previousOptions=e.options,e instanceof L.Circle||e instanceof L.Polygon||e instanceof L.Rectangle||(i.fill=!1),e.setStyle(i)),e instanceof L.Marker?e.dragging.enable():e.editing.enable()},_disableLayerEdit:function(t){var e=t.layer||t.target||t;e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.setStyle(e.options.previousOptions),delete e.options.previousOptions),e instanceof L.Marker?e.dragging.disable():e.editing.disable()},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_cloneLatLngs:function(t){for(var e=[],i=0,o=t.length;o>i;i++)e.push(this._cloneLatLng(t[i]));return e},_cloneLatLng:function(t){return L.latLng(t.lat,t.lng)}}),L.Edit.SimpleShape=L.Handler.extend({options:{moveIcon:new L.DivIcon({iconSize:L.Browser.touch?new L.Point(30,30):new L.Point(10,10),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move"}),resizeIcon:new L.DivIcon({iconSize:L.Browser.touch?new L.Point(30,30):new L.Point(10,10),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"})},initialize:function(t,e){this._shape=t,L.Util.setOptions(this,e)},addHooks:function(){this._shape._map&&(this._markerGroup||this._initMarkers(),this._shape._map.addLayer(this._markerGroup))},removeHooks:function(){this._shape._map&&(this._unbindMarker(this._moveMarker),this._unbindMarker(this._resizeMarker),this._resizeMarker.off("drag",this._onMarkerDrag),this._resizeMarker.off("dragend",this._fireEdit),this._shape._map.removeLayer(this._markerGroup),delete this._markerGroup)},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._createMoveMarker(),this._createResizeMarker()},_createMoveMarker:function(){},_createResizeMarker:function(){},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:e,zIndexOffset:10});return this._bindMarker(i),this._markerGroup.addLayer(i),i},_bindMarker:function(t){t.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._onMarkerDragEnd,this)},_unbindMarker:function(t){t.off("dragstart",this._onMarkerDragStart).off("drag",this._onMarkerDrag).off("dragend",this._onMarkerDragEnd)},_onMarkerDragStart:function(t){var e=t.target;e.setOpacity(0)},_onMarkerDrag:function(t){var e=t.target,i=e.getLatLng();e===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw()},_onMarkerDragEnd:function(t){var e=t.target;e.setOpacity(1),this._shape.fire("edit")},_move:function(){},_resize:function(){}}),L.Edit.Circle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getLatLng();this._moveMarker=this._createMarker(t,this.options.moveIcon)},_getResizeMarkerPoint:function(t){var e=this._shape._radius*Math.cos(Math.PI/4),i=this._shape._map.project(t);return this._shape._map.unproject([i.x+e,i.y-e])},_createResizeMarker:function(){var t=this._shape.getLatLng(),e=this._getResizeMarkerPoint(t);this._resizeMarker=this._createMarker(e,this.options.resizeIcon)},_move:function(t){var e=this._getResizeMarkerPoint(t);this._resizeMarker.setLatLng(e),this._shape.setLatLng(t)},_resize:function(t){var e=this._moveMarker.getLatLng(),i=e.distanceTo(t);this._shape.setRadius(i)}}),L.Circle.addInitHook(function(){L.Edit.Circle&&(this.editing=new L.Edit.Circle(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()})}),L.Edit.Rectangle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getBounds(),e=t.getCenter();this._moveMarker=this._createMarker(e,this.options.moveIcon)},_createResizeMarker:function(){var t=this._shape.getBounds(),e=t.getNorthEast();this._resizeMarker=this._createMarker(e,this.options.resizeIcon)},_onMarkerDragEnd:function(t){var e,i,o=t.target;o===this._moveMarker&&(e=this._shape.getBounds(),i=e.getCenter(),o.setLatLng(i)),L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this,t)},_move:function(t){for(var e,i=this._shape.getLatLngs(),o=this._shape.getBounds(),n=o.getCenter(),s=[],a=0,r=i.length;r>a;a++)e=[i[a].lat-n.lat,i[a].lng-n.lng],s.push([t.lat+e[0],t.lng+e[1]]);this._shape.setLatLngs(s),o=this._shape.getBounds(),this._resizeMarker.setLatLng(o.getNorthEast())},_resize:function(t){var e=this._shape.getBounds(),i=e.getNorthWest(),o=e.getNorthEast(),n=e.getSouthEast(),s=e.getSouthWest();i.lat=t.lat<s.lat?s.lat:t.lat,o.lat=t.lat<s.lat?s.lat:t.lat,o.lng=t.lng<s.lng?s.lng:t.lng,n.lng=t.lng<s.lng?s.lng:t.lng,this._shape.setLatLngs([i,o,n,s]),e=this._shape.getBounds(),this._moveMarker.setLatLng(e.getCenter())
}}),L.Rectangle.addInitHook(function(){L.Edit.Rectangle&&(this.editing=new L.Edit.Rectangle(this),this.options.editable&&this.editing.enable())})})(this);