/*    Anywhere it says "ADJUST" means you should modify based on your actual
 *     collection, dataset and redered table column's name         */

// ADJUST: Label for the submit button
const submitButtonlabel = "Submit";

// Include Workflow = true otherwise false
// If you include the Workflow, it will pass all the elements of the data row to the workflow
// As written, it will start an occurance of the Workflow for each row of data
const includeWorkflow = false;

// ADJUST: Colors
const errorColor = "mistyrose";
const successColor = "palegreen";
const highlightColor = "lemonChiffon";

// ADJUST: Title for the action column in the table
var actionColumnTitle = "Checkbox Column";

// ADJUST: Configuration of data columns used in the table
var dataObject = [
  { name: "ProjectID", label: "Project ID", type: "STRING" },
  { name: "ProjectName", label: "Project Name", type: "STRING" },
  { name: "CompletionDate", label: "Completion Date", type: "DATE" },
  { name: "Priority", label: "Priority", type: "STRING" },
  { name: "Progress", label: "Progress", type: "STRING" },
];

// ADJUST: Collection alias referenced in manifest
var collectionName = "collectionName";

// ADJUST: Dataset alias referenced in manifest
var datasets = "dataset0";

// ADJUST: Workflow alias referenced in manifest
var alias = "workflow1";

// ADJUST: Flag to determine if changes should be synced to the dataset
var syncToDataset = true;

// ADJUST: Define columns for data retrieval. Modify these based on the aliases of your dataset
// that is wired in the manifest
var dataColumnName = [
  "ProjectID",
  "ProjectName",
  "CompletionDate",
  "Priority",
  "Progress",
];
var fields = dataColumnName;
// ADJUST: Query filter, if you want to filter the dataset query. Use in conjunction with row 49 by commeting row 48 and uncommenting row 49
// var filter = ['status = Needs Review'];
// ADJUST: API query to fetch data. Modify based on your dataset. You may want to adjust the limit
var query = `/data/v1/${datasets}?fields=${fields.join()}&limit=3000`;
// var query = `/data/v1/${datasets}?fields=${fields.join()}&filter=${filter}&limit=3000`;

// Sets to track rows in various states (selected, changed, or displayed)
var selectedRows = new Set();
var changedRows = new Set();
var displayedRows = new Set();

// DOM element references
var myDiv = document.getElementById("myDiv");
var selectAllCheckbox = document.getElementById("selectAllCheckbox");
var table = document.getElementById("tableList");
var tbodyRef = table.getElementsByTagName("tbody")[0];

// Collection service to manage form data interactions
var collectionService = new CollectionService(
  collectionName,
  dataObject,
  syncToDataset
);

// Table list to manage the display and interactivity of the data
var tableList = new TableList(table, dataObject, collectionService, {
  onEdit: function (doc) {
    myModal.edit(doc);
  },
});

// Event listener for the "Select All" checkbox
selectAllCheckbox.addEventListener("change", function () {
  handleSelectAll(selectAllCheckbox.checked);
});

// Function to filter the table based on a search string
function filterTable(searchString) {
  var rows = tbodyRef.getElementsByTagName("tr");
  displayedRows.clear();
  for (var i = 0; i < rows.length; i++) {
    var shouldShow = false;
    for (var j = 0; j < rows[i].cells.length; j++) {
      var cellText = rows[i].cells[j].textContent.toLowerCase();
      if (cellText.includes(searchString.toLowerCase())) {
        shouldShow = true;
        displayedRows.add(rows[i]);
        break;
      }
    }
    rows[i].style.display = shouldShow ? "" : "none";
  }
  handleSelectAll(false);
}

// Function to handle the state of "Select All" checkbox
function handleSelectAll(checked) {
  displayedRows.forEach((row) => {
    var checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = checked;
      handleCheckboxChange({ target: checkbox }, row);
    }
  });
}

// Function to add an input event listener to a table row
function addInputListener(input, row) {
  input.addEventListener("input", function (event) {
    handleInputChange(event, row);
  });
}

let arr;

// Fetch data and populate the table
domo.get(query).then((data) => {
  arr = data;
  const size = arr.length;

  if (!tbodyRef) {
    console.error("The table body does not exist!");
    return;
  }
  // The options below will determine what appears in the dropdown. Copy and recreate as needed.
  const selector1Options = ["Type 1", "Type 2", "Type 3"];
  // const selector2Options = ['Selection 1', 'Selection 2', 'Selection 3']
  // Populate the table rows with data
  for (let i = 0; i < size; i++) {
    const row = document.createElement("tr");
    // If you want rows to be editable when certain criteria is met, adjust the line below and uncomment it
    // Change status to your column name, and Not Submitted to your value. Comment out the other isEditable const
    // const isEditable = arr[i].status === "Not Submitted";
    const isEditable = true;
    row.setAttribute("data-row-index", i);

    // Define default values for NewLeadType and Note
    const defaultNote = ""; // Default for the note column

    dataObject.forEach(({ name }) => {
      let data = document.createElement("td");

      switch (name) {
        // Create a case for each column that you want to be adjustable
        case "dropDown": {
          // Render dropdown
          const input = document.createElement("select");
          const currentValue = arr[i].column2 || selector1Options[0];
          // choose the appropriate const from above to choose values for selection
          selector1Options.forEach((optionValue) => {
            const option = document.createElement("option");
            option.textContent = optionValue;
            option.value = optionValue;
            if (optionValue === currentValue) option.selected = true;
            input.appendChild(option);
          });
          input.disabled = !isEditable;
          input.addEventListener(
            isEditable ? "change" : null,
            handleInputChange.bind(null, row)
          );
          data.appendChild(input);
          break;
        }
        case "openText": {
          // Render an open text field
          const input = document.createElement("input");
          input.type = "text";
          input.value = defaultNote;
          input.disabled = !isEditable;
          input.addEventListener(
            isEditable ? "change" : null,
            handleInputChange.bind(null, row)
          );
          data.appendChild(input);
          break;
        }
        case "openNumber": {
          // Render an open number field
          const input = document.createElement("input");
          input.type = "number";
          input.value = defaultNote;
          input.disabled = !isEditable;
          input.addEventListener(
            isEditable ? "change" : null,
            handleInputChange.bind(null, row)
          );
          data.appendChild(input);
          break;
        }
        default: {
          // Populate data for existing dataset columns
          const value = arr[i][name] || ""; // Fallback to an empty string if the column doesn't exist in the dataset
          data.textContent = value;
          break;
        }
      }

      row.appendChild(data);
    });

    if (isEditable) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "name" + i;
      checkbox.value = "value";
      checkbox.id = "id" + i;
      addCheckboxListener(checkbox, row);
      checkbox.classList.add("form-check-input", "update-checkbox");
      row.appendChild(checkbox);
    }

    tbodyRef.appendChild(row);
  }

  filterTable("");
});

// Function to handle input changes in table rows
function handleInputChange(row, event) {
  const rowIndex = row.getAttribute("data-row-index");
  let found = Array.from(selectedRows).find(
    (e) => e.getAttribute("data-row-index") === rowIndex
  );

  if (found) {
    // Highlight the specific cell if the row is selected
    highlightCell(event.target.parentNode);
  } else {
    // Highlight the row and cell as having an error if the row is not selected
    var error = true;
    highlightRow(row, error);
    highlightCell(event.target.parentNode);
  }

  // Update the set of changed rows to include the modified row
  changedRows = new Set(
    [...changedRows].filter(
      (existingRow) => existingRow.getAttribute("data-row-index") !== rowIndex
    )
  );
  changedRows.add(row);
}

// Function to visually highlight a table row
function highlightRow(row, error) {
  if (error) {
    row.style.backgroundColor = errorColor; // Error color
  } else {
    row.style.backgroundColor = successColor; // Success color
  }
}

// Set to track cells that have been changed
const changedCells = new Set();

// Function to visually highlight a specific cell
function highlightCell(cell) {
  cell.style.backgroundColor = highlightColor; // Highlight color
  changedCells.add(cell);
}

// Function to add a listener to checkboxes for interactivity
function addCheckboxListener(checkbox, row) {
  checkbox.addEventListener("change", function (event) {
    const isChecked = event.target.checked;
    const isUserInteraction = event.isTrusted;

    if (isUserInteraction) {
      handleCheckboxChange(event, row, isChecked);
    }
  });

  // Handle the initial state of the checkbox
  const isChecked = checkbox.checked;
  handleCheckboxChange({ target: checkbox }, row, isChecked);
}

// Function to handle changes in checkbox state
function handleCheckboxChange(event, row) {
  const isChecked = event.target.checked;
  const rowIndex = row.getAttribute("data-row-index");

  if (isChecked) {
    // Add the row to the selected rows set and reset highlight
    selectedRows.add(row);
    resetRowHighlight(row);
    console.log("Checkbox checked");
  } else {
    // Remove the row from selected rows and reapply error highlight if needed
    selectedRows.delete(row);
    if (
      Array.from(changedRows).find(
        (e) => e.getAttribute("data-row-index") === rowIndex
      )
    ) {
      var error = true;
      highlightRow(row, error);
    }
  }
}

// Function to reset a row's highlight color
function resetRowHighlight(row) {
  row.style.backgroundColor = "";
}

// Function to update the label of the submit button
function setSubmitButtonLabel(label) {
  exportButton.innerText = label;
}

// Retrieve the submit button from the DOM and set its initial label
var exportButton = document.getElementById("exportButton");
setSubmitButtonLabel("Submit");

// Event listener for the submit button
exportButton.addEventListener("click", async function () {
  setSubmitButtonLabel("Submitting");

  var errorFlag = false;
  const listOfRows = [];

  // Process each changed row
  for (var row of changedRows) {
    var newrow = {};

    // Collect data from each cell of the row
    for (var j = 0, col; (col = row.cells[j]); j++) {
      if (!dataColumnName[j]) continue;
      if (
        col.firstChild.nodeName == "INPUT" ||
        col.firstChild.nodeName == "SELECT"
      ) {
        newrow[dataColumnName[j]] = col.firstChild.value;
      } else {
        newrow[dataColumnName[j]] = col.textContent;
      }
    }

    const rowIndex = row.getAttribute("data-row-index");
    const originalData = arr[rowIndex];

    // ADJUST: Set additional fields and default values that will be written to the document
    newrow["status"] = "Updated";

    // ADJUST: Extract values from inputs to save in collection
    // Add one of these for every editable column
    // The index in row.cells[X] correlates to the column number using 0 based counting (1 = 2nd column)
    const dropDownIndexPosition = 1;
    const dropDown = row.cells[dropDownIndexPosition].querySelector("select");
    if (dropDown) newrow["dropDown"] = dropDown.value || selector1Options[0];

    const openTextIndexPosition = 2;
    const openText =
      row.cells[openTextIndexPosition].querySelector('input[type="text"]');
    if (openText) newrow["openText"] = openText.value || "";

    console.log(newrow);

    // Save the row to the collection
    const response = await collectionService.add(newrow);
    listOfRows.push(response);
  }

  if (errorFlag) {
    setSubmitButtonLabel("Error");
  } else {
    setSubmitButtonLabel("Submitted");
    for (var row of changedRows) {
      highlightRow(row, false);
    }
    collectionService.runSync();
    console.log("Submitted and ran sync");
    changedRows.clear();
  }

  // Start workflows for each submitted row
  var startUrl = `/domo/workflow/v1/models/${alias}/start`;
  console.log({ listOfRows });

  {
    includeWorkflow &&
      (await Promise.all(
        listOfRows.map((row) =>
          domo.post(startUrl, {
            ...row.content,
            documentId: row.id,
            collectionId: row.collectionId,
            userId: domo.env.userId,
          })
        )
      ));
  }

  setTimeout(function () {
    setSubmitButtonLabel("Submit");
  }, 3000);
});

function TableList(tableEl, dataObj, collectionService, opts) {
  var $table, dataKeys;

  // Constructor function to initialize the table
  function constructor() {
    $table = $(tableEl);
    dataKeys = dataObj.map(function (col) {
      return col.id;
    });
    buildTableStructure();
  }

  // Show or hide a loading indicator on the table
  function showLoading(flag = true) {
    if (flag) {
      $table.addClass("loading");
      return;
    }
    $table.removeClass("loading");
    return;
  }

  // Build the table structure: header and body
  function buildTableStructure() {
    $table.append("<thead><tr></tr></thead><tbody></tbody>");
    var $headerRow = $table.find("thead tr");
    dataObj.forEach(function (column) {
      // Append a column header for each item in the data object
      $headerRow.append(`
        <th scope="col">
          ${column.label}
        </th>
      `);
    });

    // Add an additional header for the actions column
    $headerRow.append(
      `<th class="actions" scope="col">${actionColumnTitle}</th>`
    );
  }

  // Populate the table body with rows
  function buildTableBody(docs) {
    $table.find("tbody").empty();
    docs.forEach(function (doc) {
      addRow(doc);
    });
    showLoading(false);
  }

  // Load table data from the collection service
  function loadTable() {
    collectionService.getAll().then(buildTableBody);
  }

  // Add a row to the table
  function addRow(document) {
    var $row = $("<tr></tr>");
    $row.data("id", document.id);

    var data = document.content;
    dataKeys.forEach(function (key) {
      // Add a cell for each key in the data object
      var value =
        data[key] !== undefined
          ? makeSafeText(data[key])
          : `<em>undefined</em>`;
      $row.append(`<td>${value}</td>`);
    });

    // Add an actions column with "Remove" and "Edit" buttons
    var $actions = $("<td></td>").addClass("actions").appendTo($row);
    var $remove = $(`
      <button class="btn btn-light remove-btn" title="Remove">
        <i class="bi bi-trash"></i>
      </button>
    `).appendTo($actions);
    var $edit = $(`
      <button class="btn btn-light edit-btn" title="Edit">
        <i class="bi bi-pencil"></i>
      </button>
    `).appendTo($actions);

    // Attach click event listeners to the buttons
    $remove.on("click", function (ev) {
      remove(document.id, ev);
    });
    $edit.on("click", function (ev) {
      edit(document.id, ev);
    });

    // Append the row to the table body
    $table.find("tbody").append($row);
  }

  // Remove a row from the table and delete it from the collection
  function remove(id, ev) {
    $(ev.target).closest("tr").hide();
    collectionService.remove(id);
  }

  // Enable editing for a row
  function edit(id, ev) {
    clearEdit();
    $(ev.target).closest("tr").addClass("editing");
    var doc = collectionService.getFromCache(id);
    opts.onEdit && opts.onEdit(doc);
  }

  // Clear the editing state from the table
  function clearEdit() {
    $table.find(".editing").removeClass("editing");
  }

  // Call the constructor to initialize the table
  constructor();

  // Return public methods
  return {
    clear: clearEdit,
  };
}

function CollectionService(collection, columnsObject, syncToDataset) {
  // Initialize variables for collection name, schema, and cache
  var collectionName = collection;
  var collectionInfoPromise = null;
  var cache = null;

  // Define the collection metadata object
  const myCollection = {
    name: collection,
    schema: { columns: columnsObject },
    syncEnabled: syncToDataset,
  };

  // Immediately check and sync collection info
  checkCollectionInfo();

  // Sync schema to ensure it matches the specified columns and sync settings
  function syncSchema(columns) {
    var requestedSchema = cleanUpSchema(columnsObjectToSchema(columns));
    return getCollectionInfo().then(function (info) {
      var currentColumns = info && info.schema && info.schema.columns;
      var requestedColumns = requestedSchema && requestedSchema.columns;

      // Determine if the current schema matches the requested schema
      var schemaIsSame =
        info.syncEnabled === syncToDataset &&
        currentColumns &&
        requestedColumns &&
        currentColumns.length === requestedColumns.length &&
        !requestedColumns.some(function (column) {
          var index = currentColumns.findIndex(function (col) {
            return col.name === column.name;
          });
          return index === -1 || column.type !== currentColumns[index].type;
        });

      // Update the collection if the schema is different
      if (!schemaIsSame) {
        return updateCollection(requestedSchema, syncToDataset);
      }
      return schemaIsSame;
    });
  }

  // Convert a columns object into a schema object
  function columnsObjectToSchema(obj) {
    return {
      columns: obj.map(function (column) {
        return {
          type: getColumnType(column.type),
          name: column.name,
          visible: true,
        };
      }),
    };
  }

  // Map column types to datastore-compatible types
  function getColumnType(type) {
    switch (type.toUpperCase && type.toUpperCase()) {
      case "TEXT":
        return "STRING";
      case "NUMBER":
        return "DOUBLE";
      case "STRING":
      case "LONG":
      case "DECIMAL":
      case "DOUBLE":
      case "DATE":
      case "DATETIME":
        return type.toUpperCase();
      default:
        return "STRING";
    }
  }

  // Get collection information, caching the result
  function getCollectionInfo() {
    if (collectionInfoPromise == null) {
      collectionInfoPromise = domo.get(
        `/domo/datastores/v1/collections/${collectionName}`
      );
    }
    return collectionInfoPromise;
  }

  // Check collection info and sync schema or create a new collection
  function checkCollectionInfo() {
    domo
      .get(`/domo/datastores/v1/collections/${collectionName}/documents`)
      .then((data) => {
        console.log("Found collection");
        syncSchema(columnsObject);
      })
      .catch((error) => {
        console.log(
          "Error in getting collection. Will create a new collection."
        );
      });
  }

  // Update the collection schema and sync settings
  function updateCollection(schema, syncEnabled) {
    return getCollectionInfo().then(function (info) {
      return domo.put(`/domo/datastores/v1/collections/${collectionName}`, {
        schema: cleanUpSchema(schema),
        syncEnabled: syncEnabled != null ? syncEnabled : info.syncEnabled,
      });
    });
  }

  // Cleanup schema by normalizing column names and types
  function cleanUpSchema(schema) {
    return Object.assign({}, schema, {
      columns: schema.columns.map((col) => ({
        name: col.name || col.label,
        type: getColumnType(col.type),
      })),
    });
  }

  // Trigger a sync operation
  function runSync() {
    return domo
      .post(`/domo/datastores/v1/export?includeRelatedCollections=true`)
      .then((res) => {
        const Status = { STARTED: 200, IN_PROGRESS: 423 };
        return (
          res.status === Status.STARTED || res.status === Status.IN_PROGRESS
        );
      });
  }

  // Get all documents from the collection
  function getAll() {
    return domo
      .get(`/domo/datastores/v1/collections/${collectionName}/documents`)
      .then((res) => (cache = res));
  }

  // Get a single document by ID
  function get(documentId) {
    return domo.get(
      `/domo/datastores/v1/collections/${collectionName}/documents/${documentId}`
    );
  }

  // Get a document from the local cache
  function getFromCache(documentId) {
    return cache.find((doc) => doc.id === documentId);
  }

  // Add a new document to the collection
  function add(content) {
    return domo
      .post(`/domo/datastores/v1/collections/${collectionName}/documents/`, {
        content: content,
      })
      .then((res) => res);
  }

  // Remove a document by ID
  function remove(documentId) {
    return domo
      .delete(
        `/domo/datastores/v1/collections/${collectionName}/documents/${documentId}`
      )
      .then(() => {
        var index = cache.findIndex((doc) => doc.id === documentId);
        cache.splice(index, 1);
      });
  }

  // Expose public methods
  return {
    add,
    get,
    getAll,
    getFromCache,
    remove,
    runSync,
  };
}

// Escape text for safe database storage
function makeSafeText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
