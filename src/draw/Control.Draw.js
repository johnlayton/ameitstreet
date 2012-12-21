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
			buttonIndex = 0;

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
//        options,
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
