/*
 Copyright (c) 2012, Smartrak, Jacob Toye
 Leaflet.draw is an open-source JavaScript library for drawing shapes/markers on leaflet powered maps.
 https://github.com/jacobtoye/Leaflet.draw
*/
(function (window, undefined) {

L.drawVersion = '0.1.4';

L.Util.extend(L.LineUtil, {
	// Checks to see if two line segments intersect. Does not handle degenerate cases.
	// http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
	segmentsIntersect: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
		return	this._checkCounterclockwise(p, p2, p3) !==
				this._checkCounterclockwise(p1, p2, p3) &&
				this._checkCounterclockwise(p, p1, p2) !==
				this._checkCounterclockwise(p, p1, p3);
	},

	// check to see if points are in counterclockwise order
	_checkCounterclockwise: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
	}
});

L.Polyline.include({
	// Check to see if this polyline has any linesegments that intersect.
	// NOTE: does not support detecting intersection for degenerate cases.
	intersects: function () {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			i, j, p, p1, p2, p3;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		for (i = len - 1; i >= 3; i--) {
			p = points[i - 1];
			p1 = points[i];

			
			if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
				return true;
			}
		}

		return false;
	},

	// Check for intersection if new latlng was added to this polyline.
	// NOTE: does not support detecting intersection for degenerate cases.
	newLatLngIntersects: function (latlng, skipFirst) {
		// Cannot check a polyline for intersecting lats/lngs when not added to the map
		if (!this._map) {
			return false;
		}

		return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
	},

	// Check for intersection if new point was added to this polyline.
	// newPoint must be a layer point.
	// NOTE: does not support detecting intersection for degenerate cases.
	newPointIntersects: function (newPoint, skipFirst) {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			lastPoint = points ? points[len - 1] : null,
			// The previous previous line segment. Previous line segement doesn't need testing.
			maxIndex = len - 2;

		if (this._tooFewPointsForIntersection(1)) {
			return false;
		}

		return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
	},

	// Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
	// Cannot have intersection when < 3 line segments (< 4 points)
	_tooFewPointsForIntersection: function (extraPoints) {
		var points = this._originalPoints,
			len = points ? points.length : 0;
		// Increment length by extraPoints if present
		len += extraPoints || 0;

		return !this._originalPoints || len <= 3;
	},

	// Checks a line segment intersections with any line segements before its predecessor.
	// Don't need to check the predecessor as will never intersect.
	_lineSegmentsIntersectsRange: function (p, p1, maxIndex, minIndex) {
		var points = this._originalPoints,
			p2, p3;

		minIndex = minIndex || 0;

		// Check all previous line segments (beside the immediately previous) for intersections
		for (var j = maxIndex; j > minIndex; j--) {
			p2 = points[j - 1];
			p3 = points[j];

			if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
				return true;
			}
		}

		return false;
	}
});

L.Polygon.include({
	// Checks a polygon for any intersecting line segments. Ignores holes.
	intersects: function () {
		var polylineIntersects,
			points = this._originalPoints,
			len, firstPoint, lastPoint, maxIndex;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		polylineIntersects = L.Polyline.prototype.intersects.call(this);

		// If already found an intersection don't need to check for any more.
		if (polylineIntersects) {
			return true;
		}

		len = points.length;
		firstPoint = points[0];
		lastPoint = points[len - 1];
		maxIndex = len - 2;

		// Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
		return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
	}
});

L.Tooltip = L.Class.extend({
	initialize: function (map) {
		this._map = map;
		this._popupPane = map._panes.popupPane;

		this._container = L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane);
		this._singleLineLabel = false;
	},

	dispose: function () {
		this._popupPane.removeChild(this._container);
		this._container = null;
	},

	updateContent: function (labelText) {
		labelText.subtext = labelText.subtext || '';

		// update the vertical position (only if changed)
		if (labelText.subtext.length === 0 && !this._singleLineLabel) {
			L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = true;
		}
		else if (labelText.subtext.length > 0 && this._singleLineLabel) {
			L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = false;
		}

		this._container.innerHTML =
			(labelText.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
			'<span>' + labelText.text + '</span>';

		return this;
	},

	updatePosition: function (latlng) {
		var pos = this._map.latLngToLayerPoint(latlng);

		L.DomUtil.setPosition(this._container, pos);

		return this;
	},

	showAsError: function () {
		L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
		L.DomUtil.addClass(this._container, 'leaflet-flash-anim');
		return this;
	},

	removeError: function () {
		L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
		L.DomUtil.removeClass(this._container, 'leaflet-flash-anim');
		return this;
	}
});

L.Control.Toolbar = L.Control.extend({

  initialize: function (options) {
		L.Util.extend(this.options, options);

		this._modes = {};
	},

	_initModeHandler: function (handler, container, buttonIndex, classNamePredix) {
		var type = handler.type;

		this._modes[type] = {};

		this._modes[type].handler = handler;

		this._modes[type].button = this._createButton({
			title: handler.options.title,
			className: classNamePredix + '-' + type,
			container: container,
			callback: this._modes[type].handler.enable,
			context: this._modes[type].handler
		});

		this._modes[type].buttonIndex = buttonIndex;

		this._modes[type].handler
			.on('enabled', this._handlerActivated, this)
			.on('disabled', this._handlerDeactivated, this);
	},

	_createButton: function (options) {
		var link = L.DomUtil.create('a', options.className || '', options.container);
		link.href = '#';

		if (options.text) {
      link.innerHTML = options.text;
    }

		if (options.title) {
      link.title = options.title;
    }

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'mousedown', L.DomEvent.stopPropagation)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', options.callback, options.context);

		return link;
	},

	_handlerActivated: function (e) {
		// Disable active mode (if present)
		if (this._activeMode && this._activeMode.handler.enabled()) {
			this._activeMode.handler.disable();
		}
		
		// Cache new active feature
		this._activeMode = this._modes[e.handler];

		L.DomUtil.addClass(this._activeMode.button, 'leaflet-control-toolbar-button-enabled');

		this._showActionsToolbar();
	},

	_handlerDeactivated: function (e) {
		this._hideActionsToolbar();

		L.DomUtil.removeClass(this._activeMode.button, 'leaflet-control-toolbar-button-enabled');

		this._activeMode = null;
	},

	_createActions: function (buttons) {
		var container = L.DomUtil.create('ul', 'leaflet-control-toolbar-actions'),
			buttonWidth = 50,
			l = buttons.length,
			containerWidth = (l * buttonWidth) + (l - 1), //l - 1 = the borders
			li;

		for (var i = 0; i < l; i++) {
			li = L.DomUtil.create('li', '', container);

			this._createButton({
				title: buttons[i].title,
				text: buttons[i].text,
				container: li,
				callback: buttons[i].callback,
				context: buttons[i].context
			});
		}

		container.style.width = containerWidth + 'px';

		return container;
	},

	_showActionsToolbar: function () {
		var buttonIndex = this._activeMode.buttonIndex,
			lastButtonIndex = this._lastButtonIndex,
			buttonHeight = 25, // TODO: this should be calculated
			borderHeight = 1, // TODO: this should also be calculated
			toolbarPosition = 3 + (buttonIndex * buttonHeight) + (buttonIndex * borderHeight);
		
		// Correctly position the cancel button
		this._actionsContainer.style.top = toolbarPosition + 'px';

		// TODO: remove the top and button rounded border if first or last button
		if (buttonIndex === 0) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-control-toolbar-actions-top');
		}
		
		if (buttonIndex === lastButtonIndex) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-control-toolbar-actions-bottom');
		}
		
		this._actionsContainer.style.display = 'block';
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';

		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-control-toolbar-actions-top');
		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-control-toolbar-actions-bottom');
	}
});

L.Map.mergeOptions({
  drawControl: false
});

L.Control.Draw = L.Control.Toolbar.extend({

	options: {
		position: 'topleft',
    shapes: [
      {
        name: 'polyline',
        type: 'polyline',
        title: 'Draw a polyline'
      },
      {
        name: 'polygon',
        type: 'polygon',
        title: 'Draw a polygon'
      },
      {
        name: 'rectangle',
        type: 'rectangle',
        title: 'Draw a rectangle'
      },
      {
        name: 'circle',
        type: 'circle',
        title: 'Draw a circle'
      },
      {
        name: 'marker',
        type: 'marker',
        title: 'Add a marker'
      }
    ]
	},
	
	onAdd: function (map) {
		var container = L.DomUtil.create('div', ''),
			  buttonIndex = 0,
        handler;

		this._toolbarContainer = L.DomUtil.create('div', 'leaflet-control-toolbar');

    this.handlers = {};



    for (var i = 0; i < this.options.shapes.length; i++) {
      var options = this.options.shapes[i];

      if (options.type === 'polyline') {
        handler = new L.Draw.Polyline(map, options);

      } else if (options.type === 'polygon') {
        handler = new L.Draw.Polygon(map, options);

      } else if (options.type === 'rectangle') {
        handler = new L.Draw.Rectangle(map, options);

      } else if (options.type === 'circle') {
        handler = new L.Draw.Circle(map, options);

      } else if (options.type === 'marker') {
        handler = new L.Draw.Marker(map, options);

      } else {
        continue;
      }

      this._initModeHandler(
        handler,
        this._toolbarContainer,
        buttonIndex++,
        'leaflet-control-draw'
      );
    }

      // Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create the actions part of the toolbar
		this._actionsContainer = this._createActions([
			{
				title: 'Cancel drawing',
				text: 'Cancel',
				callback: this._cancel,
				context: this
			}
		]);
		
		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	_cancel: function (e) {
		this._activeMode.handler.disable();
	}
});

L.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new L.Control.Draw();
		this.addControl(this.drawControl);
	}
});


L.Draw.Polyline = L.Draw.Feature.extend({
	statics: {
		TYPE: 'polyline'
	},

	Poly: L.Polyline,

	options: {
    name: 'polyline',
		allowIntersection: true,
		drawError: {
			color: '#b00b00',
			message: '<strong>Error:</strong> shape edges cannot cross!',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		zIndexOffset: 2000 // This should be > than the highest z-index any map layers
	},

	initialize: function (map, options) {
		// Merge default drawError options with custom options
		if (options && options.drawError) {
			options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polyline.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},
	
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._markers = [];

			this._markerGroup = new L.LayerGroup();
			this._map.addLayer(this._markerGroup);

			this._poly = new L.Polyline([], this.options.shapeOptions);

			this._tooltip.updateContent(this._getTooltipText());

			// Make a transparent marker that will used to catch click events. These click
			// events will create the vertices. We need to do this so we can ensure that
			// we can create vertices over other map layers (markers, vector layers). We
			// also do not want to trigger any click handlers of objects we are clicking on
			// while drawing.
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('click', this._onClick, this)
				.addTo(this._map);

			this._map
				.on('mousemove', this._onMouseMove, this)
				.on('zoomend', this._onZoomEnd, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		this._clearHideErrorTimeout();

		this._cleanUpShape();
		
		// remove markers from map
		this._map.removeLayer(this._markerGroup);
		delete this._markerGroup;
		delete this._markers;

		this._map.removeLayer(this._poly);
		delete this._poly;

		this._mouseMarker.off('click', this._onClick);
		this._map.removeLayer(this._mouseMarker);
		delete this._mouseMarker;

		// clean up DOM
		this._clearGuides();

		this._map
			.off('mousemove', this._onMouseMove)
			.off('zoomend', this._onZoomEnd);
	},

	_finishShape: function () {
		var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);

		if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
			this._showErrorTooltip();
			return;
		}

		this._map.fire(
			'draw:polyline-created',
			{ poly: new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions) }
		);
		this.disable();
	},

	//Called to verify the shape is valid when the user tries to finish it
	//Return false if the shape is not valid
	_shapeIsValid: function () {
		return true;
	},
	
	_onZoomEnd: function (e) {
		this._updateGuide();
	},
	
	_onMouseMove: function (e) {
		var newPos = e.layerPoint,
			latlng = e.latlng,
			markerCount = this._markers.length;

		// Save latlng
		// should this be moved to _updateGuide() ?
		this._currentLatLng = latlng;

		// Update the label
		this._tooltip.updatePosition(latlng);
		
		// Update the guide line
		this._updateGuide(newPos);

		// Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

		L.DomEvent.preventDefault(e.originalEvent);
	},

	_onClick: function (e) {
		var latlng = e.target.getLatLng(),
			markerCount = this._markers.length;

		if (markerCount > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
			this._showErrorTooltip();
			return;
		}
		else if (this._errorShown) {
			this._hideErrorTooltip();
		}

		this._markers.push(this._createMarker(latlng));

		this._poly.addLatLng(latlng);

		if (this._poly.getLatLngs().length === 2) {
			this._map.addLayer(this._poly);
		}

		this._updateMarkerHandler();

		this._vertexAdded(latlng);
		
		this._clearGuides();
	},

	_updateMarkerHandler: function () {
		// The last marker shold have a click handler to close the polyline
		if (this._markers.length > 1) {
			this._markers[this._markers.length - 1].on('click', this._finishShape, this);
		}
		
		// Remove the old marker click handler (as only the last point should close the polyline)
		if (this._markers.length > 2) {
			this._markers[this._markers.length - 2].off('click', this._finishShape);
		}
	},
	
	_createMarker: function (latlng) {
		var marker = new L.Marker(latlng, {
			icon: this.options.icon,
			zIndexOffset: this.options.zIndexOffset * 2
		});
		
		this._markerGroup.addLayer(marker);

		return marker;
	},
	
	_updateGuide: function (newPos) {
		newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);
		
		var markerCount = this._markers.length;
		
		if (markerCount > 0) {
			// Update the tooltip text, as long it's not showing and error
			if (!this._errorShown) {
				this._tooltip.updateContent(this._getTooltipText());
			}

			// draw the guide line
			this._clearGuides();
			this._drawGuide(
				this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
				newPos
			);
		}
	},
	
	_drawGuide: function (pointA, pointB) {
		var length = Math.floor(Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))),
			i,
			fraction,
			dashPoint,
			dash;

		//create the guides container if we haven't yet (TODO: probaly shouldn't do this every time the user starts to draw?)
		if (!this._guidesContainer) {
			this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
		}
	
		//draw a dash every GuildeLineDistance
		for (i = this.options.guidelineDistance; i < length; i += this.options.guidelineDistance) {
			//work out fraction along line we are
			fraction = i / length;

			//calculate new x,y point
			dashPoint = {
				x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
				y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y))
			};

			//add guide dash to guide container
			dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
			dash.style.backgroundColor =
				!this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

			L.DomUtil.setPosition(dash, dashPoint);
		}
	},

	_updateGuideColor: function (color) {
		if (this._guidesContainer) {
			for (var i = 0, l = this._guidesContainer.childNodes.length; i < l; i++) {
				this._guidesContainer.childNodes[i].style.backgroundColor = color;
			}
		}
	},

	// removes all child elements (guide dashes) from the guides container
	_clearGuides: function () {
		if (this._guidesContainer) {
			while (this._guidesContainer.firstChild) {
				this._guidesContainer.removeChild(this._guidesContainer.firstChild);
			}
		}
	},

	_getTooltipText: function () {
		var labelText,
			distance,
			distanceStr;

		if (this._markers.length === 0) {
			labelText = {
				text: 'Click to start drawing line.'
			};
		} else {
			// calculate the distance from the last fixed point to the mouse position
			distance = this._measurementRunningTotal + this._currentLatLng.distanceTo(this._markers[this._markers.length - 1].getLatLng());
			// show metres when distance is < 1km, then show km
			distanceStr = distance  > 1000 ? (distance  / 1000).toFixed(2) + ' km' : Math.ceil(distance) + ' m';
			
			if (this._markers.length === 1) {
				labelText = {
					text: 'Click to continue drawing line.',
					subtext: distanceStr
				};
			} else {
				labelText = {
					text: 'Click last point to finish line.',
					subtext: distanceStr
				};
			}
		}
		return labelText;
	},

	_showErrorTooltip: function () {
		this._errorShown = true;

		// Update tooltip
		this._tooltip
			.showAsError()
			.updateContent({ text: this.options.drawError.message });

		// Update shape
		this._updateGuideColor(this.options.drawError.color);
		this._poly.setStyle({ color: this.options.drawError.color });

		// Hide the error after 2 seconds
		this._clearHideErrorTimeout();
		this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
	},

	_hideErrorTooltip: function () {
		this._errorShown = false;

		this._clearHideErrorTimeout();
		
		// Revert tooltip
		this._tooltip
			.removeError()
			.updateContent(this._getTooltipText());

		// Revert shape
		this._updateGuideColor(this.options.shapeOptions.color);
		this._poly.setStyle({ color: this.options.shapeOptions.color });
	},

	_clearHideErrorTimeout: function () {
		if (this._hideErrorTimeout) {
			clearTimeout(this._hideErrorTimeout);
			this._hideErrorTimeout = null;
		}
	},

	_vertexAdded: function (latlng) {
		if (this._markers.length === 1) {
			this._measurementRunningTotal = 0;
		}
		else {
			this._measurementRunningTotal +=
				latlng.distanceTo(this._markers[this._markers.length - 2].getLatLng());
		}
	},

	_cleanUpShape: function () {
		if (this._markers.length > 0) {
			this._markers[this._markers.length - 1].off('click', this._finishShape);
		}
	}
});

L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
    name: 'polygon',
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	_updateMarkerHandler: function () {
		// The first marker shold have a click handler to close the polygon
		if (this._markers.length === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}
	},

	_getTooltipText: function () {
		var text;
		if (this._markers.length === 0) {
			text = 'Click to start drawing shape.';
		} else if (this._markers.length < 3) {
			text = 'Click to continue drawing shape.';
		} else {
			text = 'Click first point to close this shape.';
		}
		return {
			text: text
		};
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexAdded: function (latlng) {
		//calc area here
	},

	_cleanUpShape: function () {
		if (this._markers.length > 0) {
			this._markers[0].off('click', this._finishShape);
		}
	}
});

L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._map.dragging.disable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			this._map.dragging.enable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		this._isDrawing = false;
	},

	_onMouseDown: function (e) {
		this._isDrawing = true;
		this._startLatLng = e.latlng;

		L.DomEvent
			.on(document, 'mouseup', this._onMouseUp, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent({ text: 'Release mouse to finish drawing.' });
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function (e) {
		if (this._shape) {
			this._fireCreatedEvent();
		}
		
		this.disable();
	}
});

L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
    name: 'circle',
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Circle.TYPE;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

  _initialLabelText: (L.Browser.touch ? 'Tap' : 'Click') + ' and drag to draw circle.',

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
	},

	_fireCreatedEvent: function () {
		this._map.fire(
			'draw:circle-created',
			{ circ: new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions) }
		);
	}
});

L.Draw.Rectangle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
    name: 'rectangle',
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Rectangle.TYPE;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},
	
	_initialLabelText: 'Click and drag to draw rectangle.',

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		this._map.fire(
			'draw:rectangle-created',
			{ rect: new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions) }
		);
	}
});

L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: 'marker'
	},

	options: {
    name: 'marker',
		icon: new L.Icon.Default(),
		zIndexOffset: 2000 // This should be > than the highest z-index any markers
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Marker.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},
	
	addHooks: function () {
    L.Draw.Feature.prototype.addHooks.call(this);
    //this._marker = null;
    if (this._map) {
      this._tooltip.updateContent({
        text: (L.Browser.touch ? 'Tap' : 'Click') + ' map to place marker.'
      });
      L.DomEvent.addListener(this._container, 'mousemove', this._onMouseMove, this);
      if (L.Browser.touch) {
        L.DomEvent.addListener(this._container, 'touchmove', this._onMouseMove, this);
        L.DomEvent.addListener(this._container, 'touchend', this._onClick, this);
      }
    }
	},

	removeHooks: function () {
    L.Draw.Feature.prototype.removeHooks.call(this);
    if (this._map) {
      if (this._marker) {
        L.DomEvent
          .removeListener(this._marker, 'click', this._onClick)
          .removeListener(this._map, 'click', this._onClick);

        if (L.Browser.touch) {
          L.DomEvent
            .removeListener(this._marker, 'touchend', this._onClick);
        }
        this._map.removeLayer(this._marker);
        delete this._marker;
      }

      L.DomEvent.removeListener(this._container, 'mousemove', this._onMouseMove);
      if (L.Browser.touch) {
        L.DomEvent
          .removeListener(this._container, 'touchmove', this._onMouseMove)
          .removeListener(this._container, 'touchend', this._onClick);
      }
    }
  },

	_onMouseMove: function (e) {
    var newPos = this._map.mouseEventToLayerPoint(e.touches ? e.touches[0] : e),
      latlng = this._map.mouseEventToLatLng(e.touches ? e.touches[0] : e);

    if (e.touches) {
      // This is necessary to stop the map from panning
      L.DomEvent.stopPropagation(e);
    }

    this._tooltip.updatePosition(newPos);

    if (!this._marker) {
      this._marker = new L.Marker(latlng, this.options.icon);
      this._map.addLayer(this._marker);
      // Bind to both marker and map to make sure we get the click event.
      L.DomEvent
        .addListener(this._marker, 'click', this._onClick, this)
        .addListener(this._map, 'click', this._onClick, this);

      if (L.Browser.touch) {
        L.DomEvent
          .addListener(this._marker, 'touchend', this._onClick, this);
      }
    }
    else {
      this._marker.setLatLng(latlng);
    }
  },

	_onClick: function (e) {
    if (e.touches) {
      // This might be a bit greedy
      L.DomEvent.stopPropagation(e);
    }
    this._map.fire(
      'draw:marker-created',
      {
        marker: new L.Marker(this._marker ? this._marker.getLatLng() : this._map.mouseEventToLatLng(e.changedTouches ? e.changedTouches[0] : e), this.options.icon)
      }
    );
    this.disable();
	}
});

/*L.Map.mergeOptions({
	editControl: true
});*/

L.Control.Edit = L.Control.Toolbar.extend({
	options: {
		position: 'topleft',
		edit: {
			title: 'Edit layers'
		},
		remove: {
			title: 'Delete layers'
		},
		featureGroup: null, /* REQUIRED! TODO: perhaps if not set then all layers on the map are selectable? */
		selectedPathOptions: null // See Edit handler options, this is used to customize the style of selected paths
	},

	initialize: function (options) {
		L.Control.Toolbar.prototype.initialize.call(this, options);

		this._selectedFeatureCount = 0;
	},
	
	onAdd: function (map) {
		var container = L.DomUtil.create('div', ''),
			buttonIndex = 0;

		this._toolbarContainer = L.DomUtil.create('div', 'leaflet-control-toolbar'),

		this._map = map;

		if (this.options.edit) {
			this._initModeHandler(
				new L.Edit.Feature(map, {
					featureGroup: this.options.featureGroup,
					selectedPathOptions: this.options.selectedPathOptions
				}),
				this._toolbarContainer,
				buttonIndex++,
				'leaflet-control-edit'
			);
		}

		if (this.options.remove) {
			this._initModeHandler(
				new L.Delete.Feature(map, {
					featureGroup: this.options.featureGroup
				}),
				this._toolbarContainer,
				buttonIndex++,
				'leaflet-control-edit'
			);
		}

		// Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create the actions part of the toolbar
		this._actionsContainer = this._createActions([
			{
				title: 'Save changes.',
				text: 'Save',
				callback: this._save,
				context: this
			},
      {
				title: 'Cancel editing, discards all changes.',
				text: 'Cancel',
				callback: this._cancel,
				context: this
			}
		]);

		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	_cancel: function () {
		this._activeMode.handler.revertLayers();
		this._activeMode.handler.disable();
	},

	_save: function () {
		this._activeMode.handler.disable();
	},

	_showCancelButton: function () {
		// TODO: check to see if this is the top of bottom button and add in the classes

		L.Control.Toolbar.prototype._showCancelButton.call(this);
	}
});

/* need to sort out how to do layerGroup
L.Map.addInitHook(function () {
	if (this.options.editControl) {
		this.editControl = new L.Control.Edit();
		this.addControl(this.editControl);
	}
});*/

L.Delete = L.Delete || {};

L.Delete.Feature = L.Handler.extend({
	statics: {
		TYPE: 'remove' // not delete as delete is reserved in js
	},

	includes: L.Mixin.Events,

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._deletableLayers = this.options.featureGroup;

		if (!(this._deletableLayers instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Delete.Feature.TYPE;
	},

	enable: function () {
		L.Handler.prototype.enable.call(this);

		this._deletableLayers
			.on('layeradd', this._enableLayerDelete, this)
			.on('layerremove', this._disableLayerDelete, this);

		this.fire('enabled', { handler: this.type});
	},

	disable: function (revert) {
		L.Handler.prototype.disable.call(this);

		this._deletableLayers
			.off('layeradd', this._enableLayerDelete)
			.off('layerremove', this._disableLayerDelete);

		this.fire('disabled', { handler: this.type});
	},

	addHooks: function () {
		if (this._map) {
			this._deletableLayers.eachLayer(this._enableLayerDelete, this);
			this._deletedLayers = new L.layerGroup();

			this._tooltip = new L.Tooltip(this._map);
			this._tooltip.updateContent({ text: 'Click on a feature to remove.' });

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			this._deletableLayers.eachLayer(this._disableLayerDelete, this);
			this._deletedLayers = null;

			this._tooltip.dispose();
			this._tooltip = null;

			this._map.off('mousemove', this._onMouseMove);
		}
	},

	revertLayers: function () {
		// Iterate of the deleted layers and add them back into the featureGroup
		this._deletedLayers.eachLayer(function (layer) {
			this._deletableLayers.addLayer(layer);
		}, this);
	},

	_enableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.on('click', this._removeLayer, this);
	},

	_disableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.off('click', this._removeLayer);

		// Remove from the deleted layers so we can't accidently revert if the user presses cancel
		this._deletedLayers.removeLayer(layer);
	},

	_removeLayer: function (e) {
		var layer = e.layer || e.target || e;

		this._deletableLayers.removeLayer(layer);

		this._deletedLayers.addLayer(layer);
	},

	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	}
});


L.Edit.Circle = L.Edit.SimpleShape.extend({

	_createMoveMarker: function () {
		var center = this._shape.getLatLng();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

  _getResizeMarkerPoint: function (latlng) {
    // From L.shape.getBounds()
    var delta = this._shape._radius * Math.cos(Math.PI / 4),
        point = this._shape._map.project(latlng);
    return this._shape._map.unproject([point.x + delta, point.y - delta]);
  },

  _createResizeMarker: function () {
		var center = this._shape.getLatLng(),
			resizemarkerPoint = this._getResizeMarkerPoint(center);

		this._resizeMarker = this._createMarker(resizemarkerPoint, this.options.resizeIcon);
	},

	_move: function (latlng) {
		var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

		// Move the resize marker
		this._resizeMarker.setLatLng(resizemarkerPoint);

		// Move the circle
		this._shape.setLatLng(latlng);
	},

	_resize: function (latlng) {
		var moveLatLng = this._moveMarker.getLatLng(),
			radius = moveLatLng.distanceTo(latlng);

		this._shape.setRadius(radius);
	}
});

L.Circle.addInitHook(function () {
	if (L.Edit.Circle) {
		this.editing = new L.Edit.Circle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});

L.Edit = L.Edit || {};

L.Edit.Feature = L.Handler.extend({
	statics: {
		TYPE: 'edit'
	},

	includes: L.Mixin.Events,

	options: {
		selectedPathOptions: {
			color: '#fe57a1', /* Hot pink all the things! */
			opacity: 0.6,
			dashArray: '10, 10',

			fill: true,
			fillColor: '#fe57a1',
			fillOpacity: 0.1
		}
	},

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		// Set options to the default unless already set
		options.selectedPathOptions = options.selectedPathOptions || this.options.selectedPathOptions;

		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._featureGroup = this.options.featureGroup;

		if (!(this._featureGroup instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		this._uneditedLayerProps = {};

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Edit.Feature.TYPE;
	},

	enable: function () {
		L.Handler.prototype.enable.call(this);

		this._featureGroup
			.on('layeradd', this._enableLayerEdit, this)
			.on('layerremove', this._disableLayerEdit, this);

		this.fire('enabled', {
      handler: this.type
    });
	},

	disable: function () {
		this.fire('disabled', {
      handler: this.type
    });

		this._featureGroup
			.off('layeradd', this._enableLayerEdit)
			.off('layerremove', this._disableLayerEdit);

		L.Handler.prototype.disable.call(this);
	},

	addHooks: function () {
		if (this._map) {
			this._featureGroup.eachLayer(this._enableLayerEdit, this);

			this._tooltip = new L.Tooltip(this._map);
			this._tooltip.updateContent({ text: 'Drag handles, or marker to edit feature.', subtext: 'Click cancel to undo changes.' });

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			// Clean up selected layers.
			this._featureGroup.eachLayer(this._disableLayerEdit, this);

			// Clear the backups of the original layers
			this._uneditedLayerProps = {};

			this._tooltip.dispose();
			this._tooltip = null;

			this._map.off('mousemove', this._onMouseMove);
		}
	},

	revertLayers: function () {
		this._featureGroup.eachLayer(function (layer) {
			this._revertLayer(layer);
		}, this);
	},

	_backupLayer: function (layer) {
		var id = L.Util.stamp(layer), latlng;

		if (!this._uneditedLayerProps[id]) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				this._uneditedLayerProps[id] = {
					latlngs: this._cloneLatLngs(layer.getLatLngs())
				};
			} else if (layer instanceof L.Circle) {
				this._uneditedLayerProps[id] = {
					latlng: this._cloneLatLng(layer.getLatLng()),
					radius: layer.getRadius()
				};
			} else { // Marker
				this._uneditedLayerProps[id] = {
					latlng: this._cloneLatLng(layer.getLatLng())
				};
			}
		}
	},

	_revertLayer: function (layer) {
		var id = L.Util.stamp(layer);

		if (this._uneditedLayerProps.hasOwnProperty(id)) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
			} else if (layer instanceof L.Circle) {
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
				layer.setRadius(this._uneditedLayerProps[id].radius);
			} else { // Marker
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
			}
		}
	},

	_toggleMarkerHighlight: function (marker) {
		// This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
		var icon = marker._icon;

		icon.style.display = 'none';

		if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
			L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, -4);

		} else {
			L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, 4);
		}

		icon.style.display = '';
	},

	_offsetMarker: function (icon, offset) {
		var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
			iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

		icon.style.marginTop = iconMarginTop + 'px';
		icon.style.marginLeft = iconMarginLeft + 'px';
	},

	_enableLayerEdit: function (e) {
		var layer = e.layer || e.target || e,
			options = L.Util.extend({}, this.options.selectedPathOptions);

		// Back up this layer (if haven't before)
		this._backupLayer(layer);

		// Update layer style so appears editable
		if (layer instanceof L.Marker) {
			this._toggleMarkerHighlight(layer);
		} else {
			layer.options.previousOptions = layer.options;

			// Make sure that Polylines are not filled
			if (!(layer instanceof L.Circle) && !(layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) {
				options.fill = false;
			}

			layer.setStyle(options);
		}

		if (layer instanceof L.Marker) {
			layer.dragging.enable();
		} else {
			layer.editing.enable();
		}
	},

	_disableLayerEdit: function (e) {
		var layer = e.layer || e.target || e;
		
		// Reset layer styles to that of before select
		if (layer instanceof L.Marker) {
			this._toggleMarkerHighlight(layer);
		} else {
			// reset the layer style to what is was before being selected
			layer.setStyle(layer.options.previousOptions);
			// remove the cached options for the layer object
			delete layer.options.previousOptions;
		}

		if (layer instanceof L.Marker) {
			layer.dragging.disable();
		} else {
			layer.editing.disable();
		}
	},

	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	},



	// TODO: move!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	// Clones a LatLngs[], returns [][]
	_cloneLatLngs: function (latlngs) {
		var clone = [];
		for (var i = 0, l = latlngs.length; i < l; i++) {
			// NOTE: maybe should try to get a clone method added to L.LatLng
			clone.push(this._cloneLatLng(latlngs[i]));
		}
		return clone;
	},

	// NOTE: maybe should get this added to Leaflet core? Also doesn't support if LatLng should be wrapped
	_cloneLatLng: function (latlng) {
		return L.latLng(latlng.lat, latlng.lng);
	}

	// TODO: move!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});

L.Edit.Rectangle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var bounds = this._shape.getBounds(),
			center = bounds.getCenter();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		var bounds = this._shape.getBounds(),
			  point = bounds.getNorthEast();

		this._resizeMarker = this._createMarker(point, this.options.resizeIcon);
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target,
			bounds, center;

		// Reset marker position to the center
		if (marker === this._moveMarker) {
			bounds = this._shape.getBounds();
			center = bounds.getCenter();

			marker.setLatLng(center);
		}
		

		L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, e);
	},

	_move: function (newCenter) {
		var latlngs = this._shape.getLatLngs(),
			bounds = this._shape.getBounds(),
			center = bounds.getCenter(),
			offset, newLatLngs = [];

		// Offset the latlngs to the new center
		for (var i = 0, l = latlngs.length; i < l; i++) {
			offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
			newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
		}

		this._shape.setLatLngs(newLatLngs);

		// Respoition the resize marker
		bounds = this._shape.getBounds();
		this._resizeMarker.setLatLng(bounds.getNorthEast());
	},

	_resize: function (latlng) {
		var bounds = this._shape.getBounds(),
			nw = bounds.getNorthWest(),
			ne = bounds.getNorthEast(),
			se = bounds.getSouthEast(),
			sw = bounds.getSouthWest();

		nw.lat = latlng.lat < sw.lat ? sw.lat : latlng.lat;
		ne.lat = latlng.lat < sw.lat ? sw.lat : latlng.lat;
		ne.lng = latlng.lng < sw.lng ? sw.lng : latlng.lng;
		se.lng = latlng.lng < sw.lng ? sw.lng : latlng.lng;

		this._shape.setLatLngs([nw, ne, se, sw]);

		// Respoition the move marker
		bounds = this._shape.getBounds();
		this._moveMarker.setLatLng(bounds.getCenter());
	}
});

L.Rectangle.addInitHook(function () {
	if (L.Edit.Rectangle) {
		this.editing = new L.Edit.Rectangle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});

// Adapted from https://github.com/shramov/Leaflet/tree/circle-edit

L.Edit.SimpleShape = L.Handler.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		})
	},

	initialize: function (shape, options) {
		this._shape = shape;
		L.Util.setOptions(this, options);
	},

	addHooks: function () {
		if (this._shape._map) {
			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._shape._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		if (this._shape._map) {
			this._unbindMarker(this._moveMarker);
			this._unbindMarker(this._resizeMarker);

			this._resizeMarker.off('drag', this._onMarkerDrag);
			this._resizeMarker.off('dragend', this._fireEdit);

			this._shape._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
		}
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();
	},

	_createMoveMarker: function () {
		// Children override
	},

	_createResizeMarker: function () {
		// Children override
	},

	_createMarker: function (latlng, icon) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});

		this._bindMarker(marker);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindMarker: function (marker) {
		marker
			.on('dragstart', this._onMarkerDragStart, this)
			.on('drag', this._onMarkerDrag, this)
			.on('dragend', this._onMarkerDragEnd, this);
	},

	_unbindMarker: function (marker) {
		marker
			.off('dragstart', this._onMarkerDragStart)
			.off('drag', this._onMarkerDrag)
			.off('dragend', this._onMarkerDragEnd);
	},

	_onMarkerDragStart: function (e) {
		var marker = e.target;
		marker.setOpacity(0);
	},

	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else {
			this._resize(latlng);
		}

		this._shape.redraw();
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target;
		marker.setOpacity(1);

		this._shape.fire('edit');
	},

	_move: function (latlng) {
		// Children override
	},

	_resize: function (latlng) {
		// Children override
	}
});



}(this));