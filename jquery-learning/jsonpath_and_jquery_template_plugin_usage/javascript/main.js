jQuery.fn.shadeAlternateRows = function() {
	$(" > tbody > tr:not(.domain_association_row):visible:even", this)
			.addClass("odd").removeClass("even");
	$(" > tbody > tr:not(.domain_association_row):visible:odd", this).addClass(
			"even").removeClass("odd");
};

jQuery.fn.displayLoader = function() {
	if ($("#progress_loader").length) {
		$.alerts
				.alert(
						"You are in the middle of an activity. Please wait till the progress indicator indicates that it has completed fully before performing another one.",
						informationTitle);
		return false;
	} else {
		$(" span.icon_container", this).html(
				"<img id='progress_loader' src='../images/progress.gif'>");
		return true;
	}
};

var v_endpointTypes;
var v_domains;
var v_associations;

var confirmationTitle = "Confirmation";
var informationTitle = "Information";

$(function() {
	v_domains = all_data.domains;
	v_endpointTypes = all_data.endpointTypes;
	v_associations = all_data.associations;

	populateAssociationCounts();

	renderAllDomains();

	bindAllEventListeners();

	// var domainId = 400;

	// $("#domain_row_" +
	// domainId).replaceWith($("#template_domain_row_editable").tmpl(all_data.domains[domainId]));
	// $("#domain_list").shadeAlternateRows();

});

function populateAssociationCounts() {
	for (domainId in v_domains) {
		populateAssociationCount(domainId);
	}
}

function populateAssociationCount(domainId) {
	var domainAssociations = jsonPath(v_associations, "$.[?(@.sourceDomain=="
			+ domainId + "),?(@.targetDomain==" + domainId + ")]");
	if (!domainAssociations) {
		v_domains[domainId].associationCount = 0;
	} else {
		v_domains[domainId].associationCount = domainAssociations.length;
	}
}

function renderAllDomains() {
	var domains = jsonPath(v_domains, "$.*");
	if (domains == false) {
		renderNoDomainsMessage();
	} else {
		$("#template_domain_row_read_only").tmpl(domains, {
			createAssociations : true
		}).appendTo("#domain_list > tbody");
	}
	$("#domain_list").shadeAlternateRows();
}

function renderNoDomainsMessage() {
	$("#template_no_domains").tmpl().appendTo("#domain_list > tbody");
}

function toggleAssociationView(domainId) {

	var associationRowId = "#" + domainId + "_domain_association_row";
	var domainRowId = "#" + domainId + "_domain_row";

	if ($(associationRowId).length) {
		if ($("#" + domainId + "_new_association_row").length) {
			$.alerts
					.confirm(
							"The <b>Association</b> view will be closed now. Press OK to proceed without creating the new <b>Association</b>.",
							confirmationTitle, function(result) {
								if (result) {
									$(associationRowId).remove();
									toggleAssociationCellBackground(domainId);
								}
							});
		} else {
			$(associationRowId).remove();
			toggleAssociationCellBackground(domainId);
		}
	} else {
		$(domainRowId)
				.after(
						$("#template_domain_association_row").tmpl(
								v_domains[domainId]));
		$("#" + domainId + "_domain_association_table").shadeAlternateRows();

		toggleAssociationCellBackground(domainId);
	}
}

function toggleAssociationCellBackground(domainId) {
	var domainRowId = "#" + domainId + "_domain_row";
	var associationCell = $(domainRowId + " > td:.expanded, " + domainRowId
			+ " > td:.collapsed");
	associationCell.toggleClass("expanded collapsed");
}

function createNewDomainRow() {
	if (!$("#domain_row_new").length) {
		var newDomain = $("#template_domain_row_new").tmpl();
		if ($("#no_domains").length) {
			$("#no_domains").replaceWith(newDomain);
		} else {
			newDomain.prependTo("#domain_list > tbody");
		}

		$("#domain_list").shadeAlternateRows();
	} else {
		$.alerts
				.alert(
						"You are already in the process of creating a new <b>Domain</b>. Please complete it before creating another one.",
						informationTitle);
	}
}

function removeNewDomainRow() {
	$("#domain_row_new").remove();

	if (!jsonPath(v_domains, "$.*")) {
		renderNoDomainsMessage();
	}

	$("#domain_list").shadeAlternateRows();
}

function makeDomainReadOnly(domainId) {

	var domainRowId = "#" + domainId + "_domain_row";

	$(domainRowId).replaceWith(
			$("#template_domain_row_read_only").tmpl(v_domains[domainId], {
				createAssociations : false
			}));
	$("#domain_list").shadeAlternateRows();

	if ($("#" + domainId + "_domain_association_row").is(":visible")) {
		$(domainRowId + " > td:.collapsed").toggleClass("expanded collapsed");
	}
}

function makeDomainEditable(domainId) {

	var domainRowId = "#" + domainId + "_domain_row";

	$(domainRowId).replaceWith(
			$("#template_domain_row_editable").tmpl(v_domains[domainId]));
	$("#domain_list").shadeAlternateRows();

	if ($("#" + domainId + "_domain_association_row").is(":visible")) {
		$(domainRowId + " > td:.collapsed").toggleClass("expanded collapsed");
	}

}

function cancelDomainEdit(domainId) {
	makeDomainReadOnly(domainId);
}

function saveDomain(domainId) {
	var rowId = $("#" + domainId + "_domain_row");
	var domainName = rowId.find("input[name='domain_name']").val();
	var endpointType = rowId.find("select[name='domain_endpoint_type']").val();
	var endpointAddress = rowId.find("input[name='domain_endpoint_address']")
			.val();

	var currentDomainData = v_domains[domainId];

	currentDomainData.name = domainName;
	currentDomainData.endpointType = endpointType;
	currentDomainData.endpointAddress = endpointAddress;

	setTimeout(function() {
		makeDomainReadOnly(domainId);
	}, 1000);

}

function deleteDomain(domainId) {

	var domainAssociations = jsonPath(v_associations, "$.[?(@.sourceDomain=="
			+ domainId + "),?(@.targetDomain==" + domainId + ")]");

	if (domainAssociations) {
		for ( var index in domainAssociations) {
			var isSource = (domainAssociations[index].sourceDomain == domainId);
			if (isSource) {
				deleteAssociation(domainAssociations[index].id, false, true);
			} else {
				deleteAssociation(domainAssociations[index].id, true, false);
			}
		}
	}

	delete v_domains[domainId];

	var rowId = $("#" + domainId + "_domain_row");
	var associationRowId = "#" + domainId + "_domain_association_row";

	$(rowId).remove();
	$(associationRowId).remove();

	if (!jsonPath(v_domains, "$.*")) {
		renderNoDomainsMessage();
	}

	$("#domain_list").shadeAlternateRows();
}

function saveNewDomain() {
	var rowId = $("#domain_row_new");
	var domainName = rowId.find("input[name='domain_name']").val();
	var endpointType = rowId.find("select[name='domain_endpoint_type']").val();
	var endpointAddress = rowId.find("input[name='domain_endpoint_address']")
			.val();

	var newDomainId = Math.ceil(Math.random() * 100000);

	v_domains[newDomainId] = {
		id : newDomainId,
		name : domainName,
		endpointType : endpointType,
		endpointAddress : endpointAddress,
		associationCount : 0
	};

	rowId.replaceWith($("#template_domain_row_read_only").tmpl(
			v_domains[newDomainId], {
				createAssociations : true
			}));
	$("#domain_list").shadeAlternateRows();
}

function createNewDomainAssociationRow(domainId) {
	if (jsonPath(v_domains, "$.*").length > 1) {
		var associationRowId = "#" + domainId + "_new_association_row";
		var associationTableId = "#" + domainId + "_domain_association_table";
		if (!$(associationRowId).length) {
			var newAssociation = $("#template_new_association_row").tmpl({
				domainId : domainId
			});
			if ($("#" + domainId + "_no_associations").length) {
				$("#" + domainId + "_no_associations").replaceWith(
						newAssociation);
			} else {
				newAssociation.prependTo(associationTableId + " > tbody");
			}
			$(associationTableId).shadeAlternateRows();
		} else {
			$.alerts
					.alert(
							"You are already in the process of creating a new <b>Association</b>. Please complete it before creating another one.",
							informationTitle);
		}
	} else {
		$.alerts
				.alert(
						"There is only one <b>Domain</b> present. Please add more <b>Domains</b> if you want to create <b>Associations<b>.",
						informationTitle);
	}
}

function removeNewDomainAssociationRow(domainId) {
	var associationRowId = "#" + domainId + "_new_association_row";
	var associationTableId = "#" + domainId + "_domain_association_table";
	$(associationRowId).remove();

	// $(associationTableId).shadeAlternateRows();

	renderDomainAssociations(domainId);
}

function deleteAssociation(associationId, includeSource, includeTarget) {

	var sourceDomainId = v_associations[associationId].sourceDomain;
	var targetDomainId = v_associations[associationId].targetDomain;

	delete v_associations[associationId];

	if (includeSource) {
		v_domains[sourceDomainId].associationCount--;
		renderDomainAssociations(sourceDomainId);
	}

	if (includeTarget) {
		v_domains[targetDomainId].associationCount--;
		renderDomainAssociations(targetDomainId);
	}

}

function renderDomainAssociations(domainId) {

	var domainData = v_domains[domainId];

	var associationRowId = "#" + domainId + "_domain_association_row";
	var domainRowId = "#" + domainId + "_domain_row";

	$(domainRowId + " a:.domain_association_link").text(
			domainData.associationCount);

	if ($(associationRowId).length) {
		$(associationRowId).replaceWith(
				$("#template_domain_association_row").tmpl(domainData));

		$("#" + domainId + "_domain_association_table").shadeAlternateRows();
	}
}

function saveNewAssociation(domainId) {
	var rowId = $("#" + domainId + "_new_association_row");
	var sourceDomainId = domainId;
	var targetDomainId = rowId.find("select[name='related_domain']").val();
	var rule = rowId.find("select[name='association_rule']").val();

	if (!v_domains[targetDomainId]) {
		$.alerts
				.alert("The target <b>Domain</b> chosen for this <b>Association</b> has been deleted. Please validate your input.");
	} else if (!jsonPath(v_associations, "$.[?(@.sourceDomain=="
			+ sourceDomainId + " & @.targetDomain==" + targetDomainId + ")]")) {

		var newAssociationId = Math.ceil(Math.random() * 100000);

		v_associations[newAssociationId] = {
			id : newAssociationId,
			sourceDomain : sourceDomainId,
			targetDomain : targetDomainId,
			rule : rule
		};

		v_domains[sourceDomainId].associationCount++;
		v_domains[targetDomainId].associationCount++;

		renderDomainAssociations(sourceDomainId);
		renderDomainAssociations(targetDomainId);
	} else {
		$.alerts
				.alert("This <b>Association</b> already exists. Please validate your input.");
	}

}

// Binding Event Listeners

function bindAllEventListeners() {

	bindDomainListeners();

	bindAssociationListeners();

}

function bindDomainListeners() {
	$("#new_domain").click(createNewDomainRow);
	$("#domain_row_new .action_save")
			.live(
					"click",
					function(event) {
						$.alerts
								.confirm(
										"This <b>Domain</b> will be created now with the data provided by you. Click on OK to proceed.",
										confirmationTitle, function(result) {
											if (result) {
												saveNewDomain();
											}
										});
					});
	$("#domain_row_new .action_cancel").live("click", removeNewDomainRow);

	$(
			"tr:.domain_row a.action_edit, tr:.domain_row a.action_save, tr:.domain_row a.action_cancel, tr:.domain_row a.action_delete")
			.live(
					"click",
					function(event) {
						var domainId = $(event.target).closest("tr").attr("id")
								.match(".*(?=_domain_row)");
						var linkClicked = $(event.target).closest("a");

						if (linkClicked.hasClass("action_edit")) {
							makeDomainEditable(domainId);
						} else if (linkClicked.hasClass("action_cancel")) {
							cancelDomainEdit(domainId);
						} else if (linkClicked.hasClass("action_save")) {
							$.alerts
									.confirm(
											"This <b>Domain</b> will be saved now with your modifications. Click on OK to proceed.",
											confirmationTitle,
											function(result) {
												if (result) {
													if ($(
															"#"
																	+ domainId
																	+ "_domain_row")
															.displayLoader()) {
														saveDomain(domainId);
													}
												}
											});
						} else if (linkClicked.hasClass("action_delete")) {
							$.alerts
									.confirm(
											"This <b>Domain</b> will be deleted permanently. Click OK to proceed",
											"Delete Confirmation", function(
													result) {
												if (result) {
													deleteDomain(domainId);
												}
											});
						}
					});

}

function bindAssociationListeners() {
	$(".domain_association_link").live(
			"click",
			function(event) {
				var domainId = $(event.target).closest("tr").attr("id").match(
						".*(?=_domain_row)");
				toggleAssociationView(domainId);
			});

	$(".new_association").live(
			"click",
			function(event) {
				var domainId = $(event.target).closest("tr").attr("id").match(
						".*(?=_domain_association_row)");
				createNewDomainAssociationRow(domainId);
			});

	$(
			"tr:.domain_association_row a.action_cancel, tr:.domain_association_row a.action_save, tr:.domain_association_row a.action_delete")
			.live(
					"click",
					function(event) {
						var linkClicked = $(event.target).closest("a");

						if (linkClicked.hasClass("action_cancel")) {
							var domainId = $(event.target).closest("tr").attr(
									"id").match(".*(?=_new_association_row)");
							removeNewDomainAssociationRow(domainId);
						} else if (linkClicked.hasClass("action_save")) {
							$.alerts
									.confirm(
											"This <b>Association</b> will be added now to this <b>Domain</b>. Click on OK to proceed.",
											confirmationTitle,
											function(result) {
												if (result) {
													var domainId = $(
															event.target)
															.closest("tr")
															.attr("id")
															.match(
																	".*(?=_new_association_row)");
													saveNewAssociation(domainId);
												}
											});
						} else if (linkClicked.hasClass("action_delete")) {
							$.alerts
									.confirm(
											"This <b>Association</b> will be deleted permanently. Click OK to proceed",
											"Delete Confirmation",
											function(result) {
												if (result) {
													var ids = $(event.target)
															.closest("tr")
															.attr("id")
															.match(
																	".*(?=_association_row)")[0]
															.split("_");
													var domainId = ids[0];
													var associationId = ids[1];
													deleteAssociation(
															associationId,
															true, true);
												}
											});
						}
					});
}
