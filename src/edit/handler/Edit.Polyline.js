L.Edit.Polyline = L.Edit.SimpleShape.extend({
/*
  _createMoveMarker: function () {
    var bounds = this._shape.getBounds(),
      center = bounds.getCenter();

    this._moveMarker = this._createMarker(center, this.options.moveIcon);
  },

  _createResizeMarker: function () {
    var bounds = this._shape.getBounds(),
        point = bounds.getNorthEast();

    this._resizeMarker = this._createMarker(point, this.options.resizeIcon);
  }
*/
  _createMarker: function (latlng, icon) {
    var marker = new L.Marker(latlng, {
      draggable: true,
      icon: icon,
      zIndexOffset: 10
    });

    this._bindMarker(marker);

    this._markerGroup.addLayer(marker);

    return marker;
  }
});


L.Polyline.addInitHook(function () {
  if (L.Edit.Polyline) {
    this.editing = new L.Edit.Polyline(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }
});