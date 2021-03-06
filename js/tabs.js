/**
 * Created by Julius Höfler on 30.03.15.
 */

var global_currentInputUnitName = "";
var list_units = [];
var counter_multiSelectionContextInfos = 0;
var array_multiSelectionContextInfos = [];
var array_multiSelectionMetaData = [];
var counter_multiSelectionMetaData = 0;
var bool_unitClicked = false;


// Jobs: - make details in tab "Kontextinformation" visible,
//       - hide main part
//       - get information into the selections and input fields
/**
 * Function gets information into the selection bar and input fields.
 * Furthermore hide main part in tab and show details of context information.
 * */
function showDetailContextInfo() {

    // show detail, hide main
    $("#detailContextInfo").slideDown();
    $("#mainContextInfo").slideUp();

    /* add context information in selection bar */
    // clean selections
    cleanSection("#selectContextInfos");
    cleanSection("#selectOperator");
    cleanSection("#selectPossibleValues");
    cleanSection("#selectParameter");
    cleanSection("#selectParameter2");

    // clean input fields
    $("#formContextInformation")[0].reset();

    // make objects invisible
    $("#inputContextValue").css("display", "none");
    $("#selectPossibleValues").css("display", "none");
    $("#s2id_selectPossibleValues").css("display", "none");
    $("#divContextParameter").css("display", "none");

    // fill selection "Kontextinformation"
    fillSelectionContextInformation();
}

// if home button is clicked change view
/**
 * Function changes view of context information tab from detail view to main view.
 * */
function showMainContextInfo() {

    // show main, hide detail
    $("#mainContextInfo").slideDown();
    $("#detailContextInfo").slideUp();
}

// bind unit with properties (tabs)
/**
 * Function add event listeners after learning unit creation.
 * @param {Object} newState Contains new created learning unit.
 * */
function activateFunctionalities(newState) {

    // get id from new state (unit)
    var id = newState[0].getAttribute("id");
    var unit = document.getElementById(id);
    var name = "";

    // creates variable which decides whether all or one context information have to be satisfied
    // default is all have to be satisfied
    var unitSatisfiesAllContextInfos = true;

    // get newState id in unit list
    list_units.push(unit);

    var current_unit;

    // triggered if learning unit is clicked
    $(unit).click(function(event) {

        // clear marking from all units
        for (var l=0; l<list_units.length; l++) {
            $(list_units[l]).css("background", "");
            $(list_units[l]).css("color", "");
        }

        // unit is marked --> change color
        $(unit).css("background", "#16a085");
        $(unit).css("color", "white");
        bool_unitClicked = true;

        // show tab content of the current active tab
        var activeTab = $(".tab-Container > ul > li").children("a.active").attr("href");
        $(activeTab).fadeIn();
        $(".tab-Container").show();

        // hide tab from unit label connection
        $("#tabUnitLabel").hide();

        // clear marking from label connections
        $(".aLabel").css("background-color", "");
        $(".aLabel").css("color", "");

        /* input field in tab "Eigenschaften"*/
        // get name of the unit
        if ($(unit).children("div").hasClass("title")) {
            name = (this).innerText.replace(/(\r\n|\n|\r)/gm,"");
        }

        // put name into the input field
        //var formObject = document.forms["formProperties"];
        $("#inputUnitName")[0].value = name;
        global_currentInputUnitName = name;

        // get current unit dictionary
        for (var p=0; p<myAuthorSystem.length; p++) {
            if (myAuthorSystem[p]["name"] == $("#lname")[0].innerText) {
                for (var q=0; q<myAuthorSystem[p]["units"].length; q++) {
                    if (myAuthorSystem[p]["units"][q]["name"] == name) {
                        current_unit = myAuthorSystem[p]["units"][q];
                    }
                }
            }
        }

        // get current unit dictionary if scenario was loaded
        if (loadedData) {
            for (var q=0; q<loadedData["units"].length; q++) {
                if (loadedData["units"][q]["name"] == name) {
                    current_unit = loadedData["units"][q];
                }
            }
        }

        // set description field
        $("#inputUnitDescription")[0].value = current_unit["description"];


        /* tab "Kontextinformation" */
        // check how much context information are needed to reach SAT
        var ciSAT = $(unit).children("div.unit-icons")[0].getAttribute("ci");
        if (ciSAT == "all") {
            $("#s2id_selectNumberContextInfos").children("a").children("span.select2-chosen").html("Alle");
        } else if (ciSAT == "one") {
            $("#s2id_selectNumberContextInfos").children("a").children("span.select2-chosen").html("Eine");
        }

        // clear multi selection in context info tab
        $("#selectMultiContextInfos").empty();
        $("#selectMultiContextInfos").select2("data", null);
        array_multiSelectionContextInfos = [];

        // change format: add icons to text
        $("#selectMultiContextInfos").select2({
            formatSelection: formatMultiContextInfos,
            formatResult: formatMultiContextInfos,
            escapeMarkup: function(m) {return m;}
        });

        // get data back in multi selection bar from a past edited learning unit
        var array_unitIcons = $(unit).find(".unit-icon");
        for (var n=0; n<array_unitIcons.length; n++) {
            array_multiSelectionContextInfos.push({
                "id":$(array_unitIcons[n]).children("img")[0].getAttribute("ccID"),
                "text":$(array_unitIcons[n]).children("img")[0].title
            });
        }
        // get data in multi selection bar
        $("#selectMultiContextInfos").select2("data", array_multiSelectionContextInfos);
        
        // check if multi selection bar is empty
        if ( jQuery.isEmptyObject($("#selectMultiContextInfos").select2("data")) ) {
            $("#mainContextInfoSAT").hide();
            $("#mainContextInfoSelection").hide();
        } else {
            $("#mainContextInfoSAT").show();
            $("#mainContextInfoSelection").show();
        }

        // needed too re-color the selections
        changeColorMultiContextInfos();


        /* multi selection bar in tab "Metadaten" */
        // clear multi selection in meta data tab
        $("#selectMultiMetaData").empty();
        $("#selectMultiMetaData").select2("data", null);
        array_multiSelectionMetaData = [];

        // get data back in multi selection bar from a past edited learning unit
        var array_icons = $(unit).find(".unit-meta-icons");
        for (var j=0; j<array_icons.length; j++) {
            array_multiSelectionMetaData.push({"id":j, "text":$(array_icons[j])[0].title});
        }

        // change format: add icons to text
        $("#selectMultiMetaData").select2({
            formatSelection: formatMultiMetaData,
            escapeMarkup: function(m) {return m;}
        });
        // get data in multi selection bar
        $("#selectMultiMetaData").select2("data", array_multiSelectionMetaData);

        // prevents that underlying container is also clicked (needed for unit marking)
        event.stopPropagation();

        //console.log(myAuthorSystem);
        console.log(JSON.stringify(myAuthorSystem));
    });

    // triggered if one option was selected ("Eine" or "Alle")
    $("#selectNumberContextInfos").select2().on("select2-selecting", function(e) {

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // decides that one of the group of selected context information has to be satisfied (1 == "Eine")
            if (e.val == 1) {

                // if a border already exists and is unequal to 1 --> change design
                if (unitSatisfiesAllContextInfos) {
                    // check if icons exist
                    if ($(unit).children("div.unit-icons").children("div.unit-icon").length != 0) {
                        $(unit).children("div.unit-icons").css("border", "2px dotted #adadad");

                        // check if ci attribute exists and change attribute ci
                        if ($(unit).children("div.unit-icons")[0].hasAttribute("ci")) {
                            $(unit).children("div.unit-icons").attr("ci", "one");
                        }
                    }
                }
                // false == one has to be satisfied
                unitSatisfiesAllContextInfos = false;

                // change sat information in current unit
                current_unit["sat"] = "one";
            }
            // decides that all of the group of selected context information has to be satisfied (0 == "Alle")
            if (e.val == 0) {

                // if a border already exists and is unequal to 0 --> change design
                if (!unitSatisfiesAllContextInfos) {
                    if ($(unit).children("div.unit-icons").children("div.unit-icon").length != 0) {
                        $(unit).children("div.unit-icons").css("border", "2px solid #adadad");

                        // check if ci attribute exists and change attribute ci
                        if ($(unit).children("div.unit-icons")[0].hasAttribute("ci")) {
                            $(unit).children("div.unit-icons").attr("ci", "all");
                        }
                    }
                }
                // true == all have to be satisfied
                unitSatisfiesAllContextInfos = true;

                // change sat information in current unit
                current_unit["sat"] = "all";
            }
        }
    });

    // triggered if string is changed in input field in tab "Eigenschaften"
    $("#inputUnitName").bind("input", function() {

        // get current input field value
        var val = $(this).val();

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // store old name
            var old_name = name;

            // change unit name if his corresponding input field is changing
            $(unit).children("div.title")[0].innerText = val;
            //name = $(unit).children("div.title")[0].innerText;
            name = val;
            global_currentInputUnitName = val;

            // find right scenario in menu bar
            var scenarioName = $("#lname")[0].innerText;
            var findScenario = $("span.title").filter(":contains('" + scenarioName + "')");
            findScenario = findScenario.parent("a").parent("li");

            // change name in menu bar
            if (findScenario.length != 0) {
                var findUnit = findScenario.children("ul").children("li").children("a")
                    .children("span").filter(":contains('" + old_name + "')");
                findUnit[0].innerHTML = val;
            }

            // update JSON structure
            current_unit["name"] = name;

            // necessary to redraw endpoints
            inst.repaintEverything();
        }
    });

    // triggered if string is changed in description field in tab "Eigenschaften"
    $("#inputUnitDescription").bind("input", function() {

        // get current input field value
        var val = $(this).val();

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // update JSON structure
            current_unit["description"] = val;
        }
    });

    // triggered if an operator was selected in tab "Kontextinformation"
    $("#selectOperator").select2().on("select2-selecting", function(e) {
        // check string of the operator value
        if (e.choice.text == "Hat keinen Wert") {
            // disable input field if operator needs no value
            if ($("#inputContextValue").css("display") == "block") {
                $("#inputContextValue").attr("disabled", true);
            }
            // disable selection bar if operator needs no value
            if ($("#selectPossibleValues").css("display") == "block") {
                $("#selectPossibleValues").attr("disabled", true);
            }

            // in both cases enable input/selection if operator needs a value
        } else {
            if ($("#inputContextValue").css("display") == "block") {
                $("#inputContextValue").attr("disabled", false);
            }
            if ($("#selectPossibleValues").css("display") == "block") {
                $("#selectPossibleValues").attr("disabled", false);
            }
        }
    });

    // triggered if one option in multi selection bar in tab "Kontextinformation" was removed
    $("#selectMultiContextInfos").select2().on("select2-removed", function(e) {

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // remove this option from array
            for (var m=0; m<array_multiSelectionContextInfos.length; m++) {
                if (array_multiSelectionContextInfos[m]["text"] == e.choice.text) {
                    array_multiSelectionContextInfos.splice(m, 1);
                    break;
                }
            }

            // remove icon from learning unit
            $(unit).children("div.unit-icons").children("div.unit-icon").each(function() {
                var iconName = $(this).children("img")[0].title;
                if (iconName == e.choice.text) {
                    $(this).remove();
                }
            });

            // remove border if unit has no icons anymore
            if ($(unit).children("div.unit-icons").children("div.unit-icon").length == 0) {
                $(unit).children(".unit-icons").css("border", "");
                $(unit).children(".unit-icons").css("height", "");
                $(unit).children(".unit-icons").css("display", "");
                $(unit).css("padding-top", "");
            }

            // update JSON structure
            for (var i=0; i<current_unit["contextInformations"].length; i++) {
                if (current_unit["contextInformations"][i].name == e.choice.text) {
                    current_unit["contextInformations"].splice(i, 1);
                    break;
                }
            }

            // set endpoints on the right place
            inst.repaintEverything();
        }
    });

    // button "Bestätigen" in tab "Kontextinformation" was clicked
    // Jobs: - evaluate the selections and inputs
    //       - put context information in multi selection bar
    //       - add icons in current unit
    $("#btnConfirmContextInfo, #btnConfirmContextInfoSmall").on("click", function() {

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // check if all needed fields were filled with information
            var missing_content = "";
            var returnArray = [];
            returnArray = checkInformation(missing_content, current_unit);
            missing_content = returnArray[0];
            var selectedInfos = returnArray[1];

            // if content is missing do not except adding of the context information
            if (missing_content == "Error999") {
                return false;

            } else {

                // if something needed is missing
                if (!!missing_content) {
                    alert("[Fehler] Bitte setzen Sie Werte in den folgenden Feldern:\n" + missing_content);
                    return false;

                } else {

                    // push all new information about the context unit in current scenario
                    current_unit["contextInformations"].push(selectedInfos);

                    // get selected context information
                    var contentContextInfo = $("#selectContextInfos").select2("data");
                    var selecElem = contentContextInfo.element[0];

                    // get corresponding context class
                    var optgroup = $(selecElem).parent()[0].label;

                    // get corresponding context class id
                    var ccID = contentContextInfo.element[0].value;

                    // create icon DOM
                    var divContextIcon = $("<div>").addClass("unit-icon").attr("id", ccID + "icon");
                    //var icon = $("<img>").attr("src", "img/context-classes/" + optgroup + ".png");
                    //icon.attr("width", "15").attr("height", "15").attr("title", e.choice.text).attr("ccID", ccID);

                    // get right format for icon visualisation in learning unit
                    // case 1: context specific icon
                    // case 2: context class icon (upper class icon, only color)
                    var icon = formatUnitIcons(contentContextInfo, optgroup, ccID);

                    // get icon information in JSON structure
                    for (var j = 0; j < current_unit["contextInformations"].length; j++) {
                        if (current_unit["contextInformations"][j].name == $("#selectContextInfos").select2("data")["text"]) {
                            current_unit["contextInformations"][j].icon = icon;
                        }
                    }

                    // add icon and div to unit
                    divContextIcon.append(icon);
                    $(unit).children("div.unit-icons").append(divContextIcon);

                    /* design reasons */
                    // all SAT needs solid border
                    if (unitSatisfiesAllContextInfos) {
                        $(unit).children("div.unit-icons").css("border", "2px solid #adadad");
                        $(unit).children("div.unit-icons").attr("ci", "all");      // ci all = all context informations

                    // one SAT needs dotted border
                    } else {
                        $(unit).children("div.unit-icons").css("border", "2px dotted #adadad");
                        $(unit).children("div.unit-icons").attr("ci", "one");      // ci one = one context information
                    }
                    $(unit).children("div.unit-icons").css("border-radius", "4px");
                    $(unit).css("padding-top", "10px");
                    $(unit).children("div.unit-icons").css("height", "23px");
                    $(unit).children("div.unit-icons").css("display", "inline-block");

                    // set endpoints on the right place
                    inst.repaintEverything();

                    /* get selected context information name into multi selection bar */
                    var id = $("#selectContextInfos").select2("data").id;

                    // get name
                    var contextInfoName = $("#selectContextInfos").select2("data").text;
                    var option = $("<option>").attr("value", id.toString()).attr("selected", "selected");
                    option.html(contextInfoName);

                    // change format: add icons to text
                    $("#selectMultiContextInfos").select2({
                        formatSelection: formatMultiContextInfos,
                        formatResult: formatMultiContextInfos,
                        escapeMarkup: function (m) {
                            return m;
                        }
                    });

                    // get name into multi selection
                    //$("#selectMultiContextInfos").append(option);
                    array_multiSelectionContextInfos.push({id: id, text: contextInfoName});
                    $("#selectMultiContextInfos").select2("data", array_multiSelectionContextInfos);

                    // change color per option in multi selection bar
                    changeColorMultiContextInfos();

                    // increase counter --> needed for continuous ids
                    counter_multiSelectionContextInfos++;

                    // show main, hide detail
                    $("#mainContextInfo").slideDown();
                    $("#detailContextInfo").slideUp();

                    // show SAT and multi selection bar
                    $("#mainContextInfoSAT").show();
                    $("#mainContextInfoSelection").show();

                    //console.log(myAuthorSystem);
                    //console.log(JSON.stringify(myAuthorSystem));
                }
            }

        }
    });

    // triggered if an option in selection "Metadaten" was selected
    $("#selectMetaData").select2().on("select2-selecting", function(e) {

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // no two same meta data symbols allowed
            for (var i = 0; i < array_multiSelectionMetaData.length; i++) {
                if (array_multiSelectionMetaData[i]["text"] == e.choice.text) {
                    return true;
                }
            }

            // create meta data DOM
            var divMetaIcon = $("<div>").addClass("unit-meta-icons").attr("id", counter_multiSelectionMetaData + "metaIcon");

            // choose icon symbol and add it to meta data DOM
            var metaIcon;
            switch (e.choice.text) {
                case "Bild":
                    metaIcon = "fui-photo";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "Film":
                    metaIcon = "fui-video";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "Text":
                    metaIcon = "fui-document";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "Navigation":
                    metaIcon = "fui-location";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "Test":
                    metaIcon = "fui-radio-unchecked";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "Audio":
                    metaIcon = "fui-volume";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
                case "3D Umgebung":
                    metaIcon = "fui-windows";
                    divMetaIcon.attr("title", e.choice.text);
                    break;
            }

            // add DOM for meta data icon (glyph)
            var bMetaIcon = $("<b>").addClass(metaIcon);

            // get icon into learning unit
            divMetaIcon.append(bMetaIcon);
            $(unit).append(divMetaIcon);

            // change size of learning unit
            $(unit).css("padding-bottom", "5px");

            // clear multi selection bar
            $("#selectMultiMetaData").empty();
            $("#selectMultiMetaData").select2("data", null);

            // get meta data in multi selection bar
            array_multiSelectionMetaData.push({"id": counter_multiSelectionMetaData, "text": e.choice.text});
            $("#selectMultiMetaData").select2({
                formatSelection: formatMultiMetaData,
                escapeMarkup: function(m) {return m;}
            });
            $("#selectMultiMetaData").select2("data", array_multiSelectionMetaData);

            counter_multiSelectionMetaData ++;

            // update JSON structure
            var currentMetaData = {};
            currentMetaData.name = e.choice.text;
            currentMetaData.icon = metaIcon;
            current_unit["metaData"].push(currentMetaData);

            // set endpoints on the right place
            inst.repaintEverything();
        }
    });

    // remove option from multi selection bar in tab "Metadaten"
    $("#selectMultiMetaData").select2().on("select2-removed", function(e) {

        // only for the selected unit
        if (name == global_currentInputUnitName) {

            // find the right meta icon
            $(unit).find("div.unit-meta-icons").each(function() {

                // get icon title name
                var icon = $(this)[0].title;

                // remove the right icon from unit
                if (icon == e.choice.text) {
                    this.remove();

                    // update the array of the multi selection meta data
                    for (var k=0; k<array_multiSelectionMetaData.length; k++) {
                        if (array_multiSelectionMetaData[k]["text"] == e.choice.text) {
                            array_multiSelectionMetaData.splice(k, 1);
                        }
                    }
                    // if no more meta icons in unit go back to old unit design
                    if (array_multiSelectionMetaData.length == 0) {
                        $(unit).css("padding-bottom", "");
                    }
                }
            });

            // update JSON structure
            for (var j=0; j<current_unit["metaData"].length; j++) {
                if (current_unit["metaData"][j].name == e.choice.text) {
                    current_unit["metaData"].splice(j, 1);
                }
            }

            // set endpoints on the right place
            inst.repaintEverything();
        }
    });

    // re-sets the glyphs in selection bar
    $("#selectMetaData").select2({
        formatSelection: formatMetaData,
        formatResult: formatMetaData,
        escapeMarkup: function(m) {return m;}
    });

    // triggered if unit was dragged
    $(unit).on("dragstop", function() {
        // get new positions (absolute)
        var top = $(unit)[0].offsetTop;
        var left = $(unit)[0].offsetLeft;

        // only set if current unit object exists
        if (current_unit) {
            current_unit.posX = left;
            current_unit.posY = top;
        }
    });

    // clear marking from existing learning units
    for (var l=0; l<list_units.length; l++) {
        $(list_units[l]).css("background", "");
        $(list_units[l]).css("color", "");
    }

    // clear multi selection bar
    $("#selectMultiContextInfos").empty();
    $("#selectMultiContextInfos").select2("data", null);
    array_multiSelectionContextInfos = [];

}

// change shown format in multi selection bar in tab "Metadaten"
/**
 * Function
 * @param {Object} item Contains the selected option from meta data selection bar.
 * @return {String} Returns DOM string which contains a meta data specific glyph.
 * */
function formatMultiMetaData(item) {

    switch (item.text) {
        case "Bild":
            return '<b class="fui-photo"></b>';
        case "Film":
            return '<b class="fui-video"></b>';
        case "Text":
            return '<b class="fui-document"></b>';
        case "Navigation":
            return '<b class="fui-location"></b>';
        case "Test":
            return '<b class="fui-radio-unchecked"></b>';
        case "Audio":
            return '<b class="fui-volume"></b>';
        case "3D Umgebung":
            return '<b class="fui-windows"></b>';
    }
}

// change shown format in selection bar in tab "Metadaten"
/**
 * Function
 * @param {Object} item Contains the selected option from meta data selection bar.
 * @return {String} Returns DOM string which contains a meta data specific glyph and the corresponding text.
 * */
function formatMetaData(item) {

    switch (item.text) {
        case "Bild":
            return '<b class="fui-photo"> </b>' + item.text;
        case "Film":
            return '<b class="fui-video"> </b> ' + item.text;
        case "Text":
            return '<b class="fui-document"> </b>' + item.text;
        case "Navigation":
            return '<b class="fui-location"> </b> ' + item.text;
        case "Test":
            return '<b class="fui-radio-unchecked"> </b> ' + item.text;
        case "Audio":
            return '<b class="fui-volume"> </b>' + item.text;
        case "3D Umgebung":
            return '<b class="fui-windows"> </b>' + item.text;
    }
}

// fill selection bars in tab "Kontextinformation"
/**
 * Function sets a event listener for selection bar context information after parsing is finished.
 * In this listener all selections and input fields were filled.
 * Furthermore the meta data selection bar is also filled with information.
 * */
function parsingFinished() {

    /* tab "Kontextinformation" */
    // triggered if a context information was selected
    $("#selectContextInfos").select2().on("select2-selecting", function(e) {
        // get index (value) of the selected option
        var j = e.val;

        // get the corresponding operators to the selected context information
        var operators = array_ContextInformations[j][2][1];

        // clear selection bar
        $("#selectOperator").empty();
        $("#selectPossibleValues").empty();

        // set empty field in selected start field
        $("#selectOperator").select2("data", {id:"\r",text:"\r"});
        $("#selectPossibleValues").select2("data", {id:"\r",text:"\r"});

        // fill selection bar "Operator"
        for (var i=0; i<operators.length; i++) {
            var option = $("<option>").attr("value", i.toString());
            option.html(operators[i]);
            $("#selectOperator").append(option);
        }

        // fill input field
        fillInputField(array_ContextInformations[j][2]);

        // fill parameter selection bar
        fillParameterSelection(array_ContextInformations[j][3]);
    });

    /* tab "Metadaten" */
    // set all needed meta data
    var array_SelectionMetaData = ["Bild", "Film", "Text", "Navigation", "Test", "Audio", "3D Umgebung"];

    // get meta data options in selection bar
    for (var i=0; i<array_SelectionMetaData.length; i++) {
        var option = $("<option>").attr("value", i.toString());
        option.html(array_SelectionMetaData[i]);
        $("#selectMetaData").append(option);
    }
    // change format: add glyphs per option
    $("#selectMetaData").select2({
        formatSelection: formatMetaData,
        formatResult: formatMetaData,
        escapeMarkup: function(m) {return m;}
    });
}

// fill selection bar "Kontextinformation"
/**
 * Function adds all context information and context classes into the selection bar context information.
 * */
function fillSelectionContextInformation() {

    // create array for all context classes
    var array_optgroups = [];

    // iterate through all context classes
    for (var j=0; j<array_ContextClasses.length; j++) {
        var classname = array_ContextClasses[j];
        var optgroup = $("<optgroup>").attr("label", classname);
        array_optgroups.push(optgroup);
    }

    // iterate through all context information
    for (var i=0; i<array_ContextInformations.length; i++) {
        // create option DOM and add the context information
        var option = $("<option>").attr("value", i.toString());
        option.attr("origin", array_ContextInformations[i][4]);     // save origin name
        option.html(array_ContextInformations[i][0]);

        // find right context class and put it in this optgroup
        for (var k=0; k<array_ContextClasses.length; k++) {
            if (array_ContextInformations[i][1][0] == array_ContextClasses[k]) {
                array_optgroups[k].append(option);
                break;
            }
        }
    }

    // change color of all context classes if selection bar "Kontextinformation" is opening
    $("#selectContextInfos").select2().on("select2-open", function() {
        $(".select2-results").children("li").children("div.select2-result-label").each(function() {
            // for all context classes set a specific color
            if ( $(this)[0].textContent == "Lernszenario" ) {
                $(this).css("background-color", "#3287C8");
                $(this).css("color", "white");
            } else if ( $(this)[0].textContent == "Persönlich" ) {
                $(this).css("background-color", "#AF46C8");
                $(this).css("color", "white");
            } else if ( $(this)[0].textContent == "Situationsbezogen" ) {
                $(this).css("background-color", "#91F52D");
                $(this).css("color", "#555555");
            } else if ( $(this)[0].textContent == "Infrastruktur" ) {
                $(this).css("background-color", "#969696");
                $(this).css("color", "white");
            } else if ( $(this)[0].textContent == "Umwelt" ) {
                $(this).css("background-color", "#FADC3C");
                $(this).css("color", "#555555");
            } else if ( $(this)[0].textContent == "Ortung" ) {
                $(this).css("background-color", "#F03C32");
                $(this).css("color", "white");
            }
        });
    });

    // change format: add glyphs per option
    $("#selectContextInfos").select2({
        formatSelection: formatContextInfos,
        formatResult: formatContextInfos,
        escapeMarkup: function(m) {return m;}
    });

    // append optgroups (context classes) and their included options in selection bar "Kontextinformation"
    for (var l=0; l<array_optgroups.length; l++) {
        $("#selectContextInfos").append(array_optgroups[l]);
    }
}

// fill input field (value in tab Kontexinformation)
/**
 * Function gets the seletect context information and decides which input field has to be set on GUI.
 * @param {Object} ci Contains current context information.
 * */
function fillInputField(ci) {

    // clear input field caused by removing input field and re-building
    $("#inputContextValue").remove();
    var inputField = $("<input>").addClass("form-control").attr("id", "inputContextValue")
        .attr("onkeyup", "getInputContextValue(this)");
    $("#divContextValue").append(inputField);

    // get type of the context information
    var type = ci[0][0]["type"];   // float, integer, string, enum, boolean

    // decide which type of input field is needed
    switch (type) {

        case "FLOAT":
            configureInputContextValueForFloatInt(ci[0]);
            break;

        case "INTEGER":
            configureInputContextValueForFloatInt(ci[0]);
            break;

        case "STRING":
            $("#inputContextValue").attr("disabled", false);        // activate input field
            $("#inputContextValue").attr("type", "text");           // set type to text
            $("#inputContextValue").css("display", "block");        // make input field visible
            $("#selectPossibleValues").css("display", "none");      // and selection bar invisible
            $("#s2id_selectPossibleValues").css("display", "none");
            $("#inputContextValue").attr("maxlength", 40);          // set max length to 40
            break;

        case "ENUM":
            $("#inputContextValue").css("display", "none");         // make input field invisible
            $("#selectPossibleValues").css("display", "block");     // and selection bar visible
            $("#s2id_selectPossibleValues").css("display", "block");

            // clear selection
            $("#selectPossibleValues").empty();
            $("#selectPossibleValues").select2("data", {id:"\r",text:"\r"});

            // fill selection bar
            for (var i=0; i<ci[2].length; i++) {
                var option = $("<option>").attr("value", i.toString());
                option.html(ci[2][i]);
                $("#selectPossibleValues").append(option);
            }
            break;

        case "BOOLEAN":
            $("#selectPossibleValues").css("display", "block");  // make selection bar visible
            $("#s2id_selectPossibleValues").css("display", "block");
            $("#inputContextValue").css("display", "none");      // and input field invisible

            // get the two possible values true and false in selection bar
            var option0 = $("<option>").attr("value", 0);
            var option1 = $("<option>").attr("value", 1);
            option0.html("falsch");
            option1.html("wahr");
            $("#selectPossibleValues").append(option1);
            $("#selectPossibleValues").append(option0);

            break;
    }
}

// set the need functionalities into the input field for float and integer values
/**
 * Function shows an input field an set minimum, maximum and default values if needed.
 * @param {Object} ci Contains current context information.
 * */
function configureInputContextValueForFloatInt(ci) {

    var min, max, def = null;

    // activate and show input field and hide selection bar
    $("#inputContextValue").attr("disabled", false);
    $("#inputContextValue").attr("type", "number");
    $("#inputContextValue").css("display", "block");
    $("#selectPossibleValues").css("display", "none");
    $("#s2id_selectPossibleValues").css("display", "none");

    for (var i=1; i<ci.length; i++) {

        // find minimum if given
        if (ci[i]["min"]) {
            min = ci[i]["min"];
        }
        // find maximum if given
        if (ci[i]["max"]) {
            max = ci[i]["max"];
        }
        // find default value if given
        if (ci[i]["default"]) {
            def = ci[i]["default"];

            // set default value in input field
            $("#inputContextValue").attr("value", def);
        }
    }

    // set minimum and maximum in input field
    if (min && max) {
        $("#inputContextValue").attr("min", min).attr("max", max);
    }
    // set minimum only
    if (min && !max) {
        $("#inputContextValue").attr("min", min);
    }
    // set maximum only
    if (!min && max) {
        $("#inputContextValue").attr("max", max);
    }
}

// get current value from input field
/**
 * Function evaluate the input value and sets too big values to maximum and too small values to minimum.
 * @param {Object} val Contains the current value of the context value input field.
 * */
function getInputContextValue(val) {

    // reduce to big values to maximum
    if ( $("#inputContextValue")[0].hasAttribute("max") ) {
        // get max attribute value
        var max = $("#inputContextValue")[0].getAttribute("max");
        max = parseInt(max);
        if (val.value > max) {
            val.value = max;
        }
    }

    // increase to little values to minimum
    if ( $("#inputContextValue")[0].hasAttribute("min") ) {
        // get min attribute value
        var min = $("#inputContextValue")[0].getAttribute("min");
        min = parseInt(min);
        if (val.value < min) {
            val.value = min;
        }
    }

    // do not allow no numbers
    /*if (val.value.length == 0) {
        var regex = /[0-9]/;
        if( !regex.test(val.value) ) {
            val.value = 0;
        }
    }*/

}

// get the current needed input fields and selection bars (tab Kontextinformation)
/**
 * Function show all needed input fields and selection bar for the selected context information.
 * @param {Object} cp Contains all existing context parameter.
 * */
function fillParameterSelection(cp) {

    // clear selection bar
    $("#selectParameter").empty();
    $("#selectParameter2").empty();

    // set empty field in selected start field
    $("#selectParameter").select2("data", {id:"\r",text:"\r"});
    $("#selectParameter2").select2("data", {id:"\r",text:"\r"});

    // clear input fields caused by removing input fields and re-building
    $("#inputContextParameter1").remove();
    $("#inputContextParameter2").remove();
    $("#inputParameterString").remove();
    var inputField = $("<input>").addClass("form-control").attr("id", "inputContextParameter1")
        .attr("type", "number").attr("onkeyup", "getParameterInput(this,1)");
    var inputField2 = $("<input>").addClass("form-control").attr("id", "inputContextParameter2")
        .attr("type", "number").attr("onkeyup", "getParameterInput(this,2)");
    var inputField3 = $("<input>").addClass("form-control").attr("id", "inputParameterString");
    $("#divParameterInput1").append(inputField);
    $("#divParameterInput2").append(inputField2);
    $("#divParameterString").append(inputField3);

    // set all parameter fields invisible
    $("#divContextParameter > div").css("display", "none");

    // cp[i][0] = parameter name
    // cp[i][1] = type (enum, string, float, integer)
    // cp[i][2] = possible values

    // iterate through all parameters
    for (var i=0; i<cp.length; i++) {

        // get the current type
        var type = cp[i][1];

        switch (type) {

            // type enum needs a drop down selection for only possible values
            case "ENUM":

                // get all possible values
                for (var j=0; j<cp[i][2].length; j++) {
                    var option = $("<option>").attr("value", j.toString());
                    option.html(cp[i][2][j]);

                    // needed if first selection is already existing
                    if ( $("#divParameterSelection1").css("display") == "block" ) {
                        // append possible values
                        $("#selectParameter2").append(option);

                        // add specific label to selection
                        $("#divParameterSelection2").children("label").html(cp[i][0]);

                        // make selection visible
                        $("#divParameterSelection2").css("display", "block");

                    } else {
                        // append possible values
                        $("#selectParameter").append(option);

                        // add specific label to selection
                        $("#divParameterSelection1").children("label").html(cp[i][0]);
                    }
                }
                // make selection visible
                $("#divParameterSelection1").css("display", "block");
                break;

            // type float needs one/two input fields and a specific label
            case "FLOAT":
                if ( $("#divParameterInput1").css("display") == "table-cell" ) {
                    $("#divParameterInput2").css("display", "table-cell");
                    $("#divParameterInput2").children("label").html(cp[i][0]);
                    setMinMax(cp[i][2], $("#inputContextParameter2"));

                    // display google maps
                    $("#divMaps").css("display", "block");
                    resizeMap();

                } else {
                    $("#divParameterInput1").css("display", "table-cell");
                    $("#divParameterInput1").children("label").html(cp[i][0]);
                    setMinMax(cp[i][2], $("#inputContextParameter1"));
                }
                break;

            // type integer needs one/two input fields and a specific label
            case "INTEGER":
                if ( $("#divParameterInput1").css("display") == "table-cell" ) {
                    $("#divParameterInput2").css("display", "table-cell");
                    $("#divParameterInput2").children("label").html(cp[i][0]);

                } else {
                    $("#divParameterInput1").css("display", "table-cell");
                    $("#divParameterInput1").children("label").html(cp[i][0]);
                }
                break;

            // type string needs an input field and a specific label
            case "STRING":
                $("#divParameterString").css("display", "block");
                $("#divParameterString").children("label").html(cp[i][0]);
                break;

        }
        // show context parameter section
        $("#divContextParameter").css("display", "block");
    }
}

// set minima and maxima if needed in input fields in tab "Kontextinformation"
/**
 * Function set minimum and maximum values for an input field.
 * @param {Array} values Contains minimum and maximum values.
 * @param {Object} inputField Contains an input field.
 * */
function setMinMax(values, inputField) {

    var min, max = null;
    for (var i=0; i<values.length; i++) {

        // find minimum if given
        if (values[i]["min"]) {
            min = values[i]["min"];
        }
        // find maximum if given
        if (values[i]["max"]) {
            max = values[i]["max"];
        }
    }

    // set minimum and maximum in input field
    if (min && max) {
        inputField.attr("min", min).attr("max", max);
    }
    // set minimum only
    if (min && !max) {
        inputField.attr("min", min);
    }
    // set maximum only
    if (!min && max) {
        inputField.attr("max", max);
    }
}

// get current value from input field
/**
 * Function evaluate the input value of the context parameter.
 * Resets values if they are too high (maximum) or too small (minimum).
 * Set marker on Google Maps if two input fields and the map are available.
 * @param {Object} val Contains current input field content.
 * @param {int} num Contains the specific input id number.
 * */
function getParameterInput(val, num) {

    // reduce to big values to maximum
    if ( $("#inputContextParameter" + num)[0].hasAttribute("max") ) {
        // get max attribute value
        var max = $("#inputContextParameter" + num)[0].getAttribute("max");
        max = parseInt(max);
        if (val.value > max) {
            val.value = max;
        }
    }

    // increase to little values to minimum
    if ( $("#inputContextParameter" + num)[0].hasAttribute("min") ) {
        // get min attribute value
        var min = $("#inputContextParameter" + num)[0].getAttribute("min");
        min = parseInt(min);
        if (val.value < min) {
            val.value = min;
        }
    }

    /* get values from inputs and set the marker on this point in google maps */
    var lat, long;
    // check if latitude is not empty
    if ($("#inputContextParameter1").val()) {
        lat = $("#inputContextParameter1").val();
    }

    // check if longitude is not empty
    if ($("#inputContextParameter2").val()) {
        long = $("#inputContextParameter2").val();
    }

    // only if both inputs have a value set marker
    if ($("#inputContextParameter1").val() && $("#inputContextParameter2").val()) {
        var new_LatLong = new google.maps.LatLng(lat, long);

        // replace old marker and set the new one
        replaceMarker2(new_LatLong);

        // conter the map and set zoom factor
        map.setCenter(new_LatLong);
        map.setOptions({zoom: 15});
    }
}

// check if all needed fields were filled with information
/**
 * Function checks whether all visible selections and input fields are not empty
 * @param {String} missing_content Contains an empty string.
 * @param {Object} current_unit Contains the current selected unit.
 * @return {Array} Returns and array which includes the string with the missing content and which an object with selected infos.
 * */
function checkInformation(missing_content, current_unit) {

    var selectedInfos = {};

    // check selection bar "Kontextinformationen"
    if ( $("#selectContextInfos").select2("data") == null ) {
        // if selection bar context information is empty, concatenate it in missing_content string
        missing_content += " - Kontextinformation\n";
    } else {
        // update JSON structure
        selectedInfos.name = $("#selectContextInfos").select2("data")["text"];
        selectedInfos.id = $("#selectContextInfos").select2("data").element[0].getAttribute("origin");
    }

    // only addable if context info doesn't exist already
    for (var h=0; h<current_unit["contextInformations"].length; h++) {
        if ($("#selectContextInfos").select2("data")["text"] == current_unit["contextInformations"][h]["name"]) {
            alert($("#selectContextInfos").select2("data")["text"] + " existiert bereits!");

            // if already exist return with error code
            return ["Error999", {}];
        }
    }

    // check selection bar "Operator"
    if ( $("#selectOperator").select2("data")["text"] == "\r" ) {
        // if selection bar operator is empty, concatenate it in missing_content string
        missing_content += " - Operator\n";
    } else {
        // update JSON structure
        selectedInfos.operator = $("#selectOperator").select2("data")["text"];
    }

    // check input "Wert" is visible AND filled with information
    if ( $("#inputContextValue")[0].style.display == "block" &&
        $("#inputContextValue")[0].disabled == false ) {

        // if input field context value is empty, concatenate it in missing_content string
        if ( $("#inputContextValue")[0].value == "" ) {
            missing_content += " - Wert\n";
            $("#inputContextValue").parent().addClass("has-error");

        } else if ($("#inputContextValue").parent().hasClass("has-error")) {
            $("#inputContextValue").parent().removeClass("has-error");
        }

        // update JSON structure
        selectedInfos.value = $("#inputContextValue")[0].value;

    // check if selection bar "Wert" is visible AND filled with information
    } else if ( $("#selectPossibleValues")[0].style.display == "block" &&
        $("#selectPossibleValues")[0].disabled != true ) {

        // if selection bar context value is empty, concatenate it in missing_content string
        if ( $("#selectPossibleValues").select2("data")["text"] == "\r" ) {
            missing_content += " - Wert\n";
        }

        // update JSON structure
        selectedInfos.value = $("#selectPossibleValues").select2("data")["text"];
    }
    // check selection bar "Parameter" is visible
    if ( $("#divParameterSelection1")[0].style.display == "block") {

        // if selection bar parameter is empty, concatenate it in missing_content string
        if ($("#selectParameter").select2("data")["text"] == "\r") {
            missing_content += " - " + $("#selectParameter")[0].labels[0].innerHTML + "\n";
        }

        // update JSON structure
        selectedInfos.parameter1 = $("#selectParameter").select2("data")["text"];
    }
    // check selection bar "Parameter" is visible
    if ( $("#divParameterSelection2")[0].style.display == "block") {

        // if selection bar parameter is empty, concatenate it in missing_content string
        if ($("#selectParameter2").select2("data")["text"] == "\r") {
            missing_content += " - " + $("#selectParameter2")[0].labels[0].innerHTML + "\n";
        }

        // update JSON structure
        selectedInfos.parameter2 = $("#selectParameter2").select2("data")["text"];
    }
    // check input context parameter 1 is visible
    if ( $("#divParameterInput1")[0].style.display == "table-cell" ) {

        // if input field context parameter is empty, concatenate it in missing_content string
        if ($("#inputContextParameter1")[0].value == "") {
            missing_content += " - " + $("#inputContextParameter1")[0].labels[0].innerHTML + "\n";
            $("#inputContextParameter1").parent().addClass("has-error");

        } else if ($("#inputContextParameter1").parent().hasClass("has-error")) {
            $("#inputContextParameter1").parent().removeClass("has-error");
        }

        // update JSON structure
        selectedInfos.input1 = $("#inputContextParameter1")[0].value;
    }
    // check input context parameter 2 is visible
    if ( $("#divParameterInput2")[0].style.display == "table-cell" ) {

        // if input field context parameter is empty, concatenate it in missing_content string
        if ($("#inputContextParameter2")[0].value == "") {
            missing_content += " - " + $("#inputContextParameter2")[0].labels[0].innerHTML + "\n";
            $("#inputContextParameter2").parent().addClass("has-error");

        } else if ($("#inputContextParameter2").parent().hasClass("has-error")) {
            $("#inputContextParameter2").parent().removeClass("has-error");
        }

        // update JSON structure
        selectedInfos.input2 = $("#inputContextParameter2")[0].value;
    }
    // check input context parameter 2 is visible
    if ( $("#divParameterString")[0].style.display == "block" ) {

        // if input field context parameter is empty, concatenate it in missing_content string
        if ($("#inputParameterString")[0].value == "") {
            missing_content += " - " + $("#inputParameterString")[0].labels[0].innerHTML + "\n";
            $("#inputParameterString").parent().addClass("has-error");

        } else if ($("#inputParameterString").parent().hasClass("has-error")) {
            $("#inputParameterString").parent().removeClass("has-error");
        }

        // update JSON structure
        selectedInfos.inputString = $("#inputParameterString")[0].value;
    }

    // create return array
    var returnArray = [missing_content, selectedInfos];

    return returnArray;
}

// change all colors in multi selection in tab "Kontextinformation"
/**
 * Function changes colors of all selected options in multi selection bar context information.
 * */
function changeColorMultiContextInfos() {

    // get all names from selected options
    var name = $("#s2id_selectMultiContextInfos > .select2-choices > .select2-search-choice > div");
    $(name).each(function() {

        // iterate over all multi selections
        for (var i=0; i<array_multiSelectionContextInfos.length; i++) {

            // get id
            var thisID = array_multiSelectionContextInfos[i]["id"];

            // needed to prevent failure, if no img exist
            var title;
            if ($(this).children("img").length != 0) {
                // get context information title
                title = $(this).children("img")[0].title;
            }

            /* new */
            // add edit icon
            var edit = $("<a>").attr("href", "#").addClass("select2-search-choice-edit").attr("tabindex", -1).attr("title", "Bearbeiten");
            //var icon = $("<b>").addClass("fui-new edit-ci").attr("style", "padding-right: 10px;");
            //edit.append(icon);
            $(this).parent().append(edit);

            $(this).parent().hover(
                function() { $(this).css("width", "85px"); },
                function() { var obj = $(this);
                    setTimeout(function() { obj.css("width", ""); }, 200);
                }
            );

            // add event listeners
            $(".select2-search-choice-edit").on("click", function(e) {
                console.log("edit");

                var nameContextInfo = $(this).parent()[0].title;
                var operator, value, parameter1, parameter2, input1, input2, inputString;

                for (var i=0; i<myAuthorSystem.length; i++) {
                    if ( myAuthorSystem[i].name == $("#lname")[0].innerText ) {
                        for (var j=0; j<myAuthorSystem[i]["units"].length; j++) {
                            if ( myAuthorSystem[i]["units"][j].name == global_currentInputUnitName ) {
                                for (var k=0; k<myAuthorSystem[i]["units"][j]["contextInformations"].length; k++) {
                                    if ( myAuthorSystem[i]["units"][j]["contextInformations"][k].name == nameContextInfo ) {
                                        operator = myAuthorSystem[i]["units"][j]["contextInformations"][k].operator;
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].value) {
                                            value = myAuthorSystem[i]["units"][j]["contextInformations"][k].value }
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].parameter1) {
                                            parameter1 = myAuthorSystem[i]["units"][j]["contextInformations"][k].parameter1 }
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].parameter2) {
                                            parameter2 = myAuthorSystem[i]["units"][j]["contextInformations"][k].parameter2 }
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].input1) {
                                            input1 = myAuthorSystem[i]["units"][j]["contextInformations"][k].input1 }
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].input2) {
                                            input2 = myAuthorSystem[i]["units"][j]["contextInformations"][k].input2 }
                                        if (myAuthorSystem[i]["units"][j]["contextInformations"][k].inputString) {
                                            inputString = myAuthorSystem[i]["units"][j]["contextInformations"][k].inputString }
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }

                for (var l= 0; l<$("#selectContextInfos")[0].length; l++) {
                    if ( $("#selectContextInfos")[0][l].text == nameContextInfo ) {
                        $("#selectContextInfos").select2("data", {id:$("#selectContextInfos")[0][l].id, text:$("#selectContextInfos")[0][l].text});
                    }
                }

                $("#mainContextInfo").hide();
                $("#detailContextInfo").show();

                e.stopPropagation();
            });
            $(".select2-search-choice-close").on("click", function(e) {
                console.log("delete");
                e.stopPropagation();
            });
            $(".select2-search-choice-close").hover(
                function() {$(this).attr("title", "Löschen")}
            );

            /* end new */

            // find right one
            if (array_multiSelectionContextInfos[i]["text"] == this.innerHTML ||    // text
                array_multiSelectionContextInfos[i]["text"] == title) {             // icon

                // get first context class
                var contextClass = array_ContextInformations[thisID][1][0];

                // get specific context class color
                var color = getColor(contextClass);
                $(this).parent().css("background-color", color);

                // set title --> tooltip if the mouse is on the icon
                $(this).parent().attr("title", title);

                break;
            }
        }
    });
}

// get the specific color for each context class
/**
 * Function finds specific color of a context class.
 * @param {String} cc Contains a context class.
 * @return {String} Returns the specific color.
 * */
function getColor(cc) {
    var color;

    switch (cc) {
        case "Lernszenario":
            color = "#3287C8";
            break;
        case "Persönlich":
            color = "#AF46C8";
            break;
        case "Situationsbezogen":
            color = "#91F52D";
            break;
        case "Infrastruktur":
            color = "#969696";
            break;
        case "Umwelt":
            color = "#FADC3C";
            break;
        case "Ortung":
            color = "#F03C32";
            break;
    }
    return color;
}

// cleans selection bars
/**
 * Function cleans a selection bar.
 * @param {String} s Contains a selection bar id.
 * */
function cleanSection(s) {
    $(s).empty();
    $(s).select2("data", {id:"\r",text:"\r"});
}

// google maps
var map;
var image;
var shadow;
var marker;
var markers = [];
$(function(){

    var currentLat, currentLng;

    // central point of the map
    var latlng = new google.maps.LatLng('52.3877833', '13.0831297');

    // creates the map
    /**
     * Function visualize Google Maps and marker on it.
     * */
    function showMap() {

        markers = [];

        var myOptions = {
            zoom: 15,                                                   // set zoom factor
            center: latlng,                                             // center map at set coordinates
            mapTypeId: 'roadmap',                                       // set map type
            mapTypeControl: true,                                       // activate map control elements
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,   // set drop down menu for control element
                position: google.maps.ControlPosition.LEFT_BOTTOM       // set position of control element
            }
        };

        // flat ui style
        var style = [/*{
         "stylers": [{
         "visibility": "off"
         }]
         },*/ {
            "featureType": "road",      // streets are white
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road.arterial",     // main streets are yellow
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#fee379"
            }]
        }, {
            "featureType": "road.highway",      // highways are yellow
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#fee379"
            }]
        }, {
            "featureType": "landscape",         // landscape is grey
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#f3f4f4"
            }]
        }, {
            "featureType": "water",             // water is blue
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#7fc8ed"
            }]
        }, {
            "featureType": "road",              // road labels are grey
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "on"
            }, {
                "weight": 1
            }, {
                "color": "#7A7A7A"
            }]
        }, {
            "featureType": "road.arterial",    // road labels are light grey
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#545454"
            }]
        }, {
            "featureType": "road.highway",     // road labels are light grey
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#545454"
            }]
        }, {
            "featureType": "poi.park",          // parks are light green
            "elementType": "geometry.fill",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#83cead"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text",   // water labels are white
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#eeeeee"
            }, {
                "weight": 1
            }]
        }, /*{
            "featureType": "transit",
            "elementType": "labels.text",   // transit labels are grey
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#B8B8B8"
            }, {
                "weight": 1
            }]
        },*/ /*{
            "featureType": "poi",
            "elementType": "labels.text",   // poi labels are grey
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#B8B8B8"
            }, {
                "weight": 1
            }]
        },*/ /*{
            "featureType": "landscape",
            "elementType": "labels.text",   // landscape labels are grey
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#B8B8B8"
            }, {
                "weight": 1
            }]
        },*/ /*{
            "featureType": "administrative",
            "elementType": "labels.text",    // administrative labels are grey
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#333333"
            }, {
                "weight": 1
            }]
        },*/ {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [{
                "weight": 0.9
            }, {
                "visibility": "off"
            }]
        }]

        // create new map object
        map = new google.maps.Map($('#maps')[0], myOptions);
        map.setOptions({
            styles: style,
            linksControl: false,
            panControl: false,
            mapTypeControl: true,
            streetViewControl: false
        });

        // get flat marker image
        image = {
            url: 'https://dl.dropboxusercontent.com/u/814783/fiddle/marker.png',
            scaledSize: new google.maps.Size(20, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 45)
        };
        // get flat marker shadow image
        shadow = {
            url: 'https://dl.dropboxusercontent.com/u/814783/fiddle/shadow.png',
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(-2, 36)
        };
        // create marker
        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: image,
            shadow: shadow
        });
        // marker not set on map per default
        marker.setMap(null);

        // set new marker if user clicked into the map
        google.maps.event.addListener(map, "click", function(e) {
            replaceMarker(e.latLng);
            currentLat = e.latLng.lat();
            $("#inputContextParameter1")[0].value = currentLat;
            currentLng = e.latLng.lng();
            $("#inputContextParameter2")[0].value = currentLng;
        });

        // delete old and set new marker
        /**
         * Function deletes old and set new google maps marker.
         * @param {Object} location Contains location of a google maps marker.
         * */
        function replaceMarker(location) {
            // deletion
            marker.setMap(null);
            for (var i = 0, mark; mark = markers[i]; i++) {
                mark.setMap(null);
            }
            markers = [];

            // set new marker
            marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: image,
                shadow: shadow
            });
        }

        /* add search box */
        // Create the search box and link it to the UI element.
        var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input')
        );
        // add input to map
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox(
            /** @type {HTMLInputElement} */(input)
        );
        //var autocomplete = new google.maps.places.Autocomplete(input);

        // [START region_getplaces]
        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }
            for (var i = 0, mark; mark = markers[i]; i++) {
                mark.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, place; place = places[i]; i++) {

                // Create a marker for each place.
                var marker = new google.maps.Marker({
                    map: map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });

                // add marker
                markers.push(marker);

                bounds.extend(place.geometry.location);

                // set input fields with coordinates
                $("#inputContextParameter1")[0].value = place.geometry.location["k"];
                $("#inputContextParameter2")[0].value = place.geometry.location["D"];
            }

            map.fitBounds(bounds);
            map.setOptions({zoom: 15});
        });
        // [END region_getplaces]

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(map, 'bounds_changed', function() {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });
        /* end search box */
    }

    // resize map due to map opening
    /*function resizeMap() {
        if (typeof map == "undefined") return;
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    }*/

    // add event listeners showMap and resizeMap
    google.maps.event.addDomListener(window, 'load', showMap);
    google.maps.event.addDomListener(window, "resize", resizeMap());
});

// resize map due to map opening
/**
 * Function resize map if it becomes visible.
 * */
function resizeMap() {
    if (typeof map == "undefined") return;
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
    map.setOptions({mapTypeControl: true});
}

// delete old and set new marker
/**
 * Function deletes old and set new google maps marker.
 * @param {Object} location Contains location of a google maps marker.
 * */
function replaceMarker2(location) {

    // clean map and delete marker
    marker.setMap(null);
    for (var i = 0, mark; mark = markers[i]; i++) {
        mark.setMap(null);
    }

    // set new marker
    markers = [];
    marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: image,
        shadow: shadow
    });
}