// create our editable grid
var editableGrid = new EditableGrid("DemoGridFull", {
	enableSort: true,
	editmode: "absolute",
	editorzoneid: "edition",
	pageSize: 20
});

// helper function to display a message
function displayMessage(text, style) {
	_$("message").innerHTML = "<p class='" + (style || "ok") + "'>" + text + "</p>";
}

// helper function to get path of a demo image
function image(relativePath) {
	return "images/" + relativePath;
}

// this will be used to render our table headers
function InfoHeaderRenderer(message) {
	this.message = message;
	this.infoImage = new Image();
	this.infoImage.src = image("information.png");
};

InfoHeaderRenderer.prototype = new CellRenderer();
InfoHeaderRenderer.prototype.render = function(cell, value)
{
	if (value) {
		var link = document.createElement("a");
		link.href = "javascript:alert('" + this.message + "');";
		link.appendChild(this.infoImage);
		cell.appendChild(document.createTextNode("\u00a0\u00a0"));
		cell.appendChild(link);
	}
};

// this function will initialize our editable grid
EditableGrid.prototype.initializeGrid = function()
{
	with (this) {
		// register the function that will handle model changes
		modelChanged = function(rowIndex, columnIndex, oldValue, newValue, row) {
			displayMessage("已将编号为" + this.getRowId(rowIndex) + "的条目的<strong>" + this.getColumnName(columnIndex) + "</strong>由<strong>" + oldValue + "</strong>改为<strong>" + newValue + "</strong>");
		};

		// update paginator whenever the table is rendered (after a sort, filter, page change, etc.)
		tableRendered = function() { this.updatePaginator(); };
		rowSelected = function(oldRowIndex, newRowIndex) {
			displayMessage("正在编辑编号为" + this.getRowId(newRowIndex) + "的条目");
		};

		// render for the action column
		setCellRenderer("操作", new CellRenderer({render: function(cell, value) {
			// this action will remove the row, so first find the ID of the row containing this cell
			var rowId = editableGrid.getRowId(cell.rowIndex);
			cell.innerHTML = "<a onclick=\"if (confirm('确定要删除这一项? ')) { editableGrid.remove(" + cell.rowIndex + "); } \" style=\"cursor:pointer\">" +
							 "<img src=\"" + image("delete.png") + "\" border=\"0\" alt=\"delete\" title=\"删除\"/></a>";
			cell.innerHTML+= "&nbsp;<a onclick=\"editableGrid.duplicate(" + cell.rowIndex + ");\" style=\"cursor:pointer\">" +
							 "<img src=\"" + image("duplicate.png") + "\" border=\"0\" alt=\"duplicate\" title=\"复制\"/></a>";
		}}));

		// render the grid (parameters will be ignored if we have attached to an existing HTML table)
		renderGrid("tablecontent", "testgrid", "tableid");

		// set active (stored) filter if any
		_$('filter').value = currentFilter ? currentFilter : '';

		// filter when something is typed into filter
		_$('filter').onkeyup = function() { editableGrid.filter(_$('filter').value); };

		// bind page size selector
		$("#pagesize").val(pageSize).change(function() { editableGrid.setPageSize($("#pagesize").val()); });
	}
};

EditableGrid.prototype.onloadJSON = function(url)
{
	// register the function that will be called when the XML has been fully loaded
	this.tableLoaded = function() {
		displayMessage("数据已读取: 总共" + this.getRowCount() + "个条目");
		this.initializeGrid();
	};

	// load JSON URL
	this.loadJSON(url);
};

EditableGrid.prototype.duplicate = function(rowIndex)
{
	// copy values from given row
	var values = this.getRowValues(rowIndex);

	// get id for new row (max id + 1)
	var newRowId = 0;
	for (var r = 0; r < this.getRowCount(); r++) newRowId = Math.max(newRowId, parseInt(this.getRowId(r)) + 1);
	values['编号'] = newRowId + '';

	// add new row
	this.insertAfter(rowIndex, newRowId, values);
};

// function to render the paginator control
EditableGrid.prototype.updatePaginator = function()
{
	var paginator = $("#paginator").empty();
	var nbPages = this.getPageCount();

	// get interval
	var interval = this.getSlidingPageInterval(20);
	if (interval == null) return;

	// get pages in interval (with links except for the current page)
	var pages = this.getPagesInInterval(interval, function(pageIndex, isCurrent) {
		if (isCurrent) return "" + (pageIndex + 1);
		return $("<a>").css("cursor", "pointer").html(pageIndex + 1).click(function(event) { editableGrid.setPageIndex(parseInt($(this).html()) - 1); });
	});

	// "first" link
	var link = $("<a>").html("<img src='" + image("gofirst.png") + "'/>&nbsp;");
	if (!this.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.firstPage(); });
	paginator.append(link);

	// "prev" link
	link = $("<a>").html("<img src='" + image("prev.png") + "'/>&nbsp;");
	if (!this.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.prevPage(); });
	paginator.append(link);

	// pages
	for (p = 0; p < pages.length; p++) paginator.append(pages[p]).append(" | ");

	// "next" link
	link = $("<a>").html("<img src='" + image("next.png") + "'/>&nbsp;");
	if (!this.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.nextPage(); });
	paginator.append(link);

	// "last" link
	link = $("<a>").html("<img src='" + image("golast.png") + "'/>&nbsp;");
	if (!this.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.lastPage(); });
	paginator.append(link);
};
