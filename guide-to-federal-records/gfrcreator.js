$(document).ready(function() {
				
	window.onload = function WindowLoad() {
	
	
	params = window.location.search.substring(1).split("&");
	
	if ((params[0].split("=")[0] == 'RG') || (params[0].split("=")[0] == 'collection')) {
		id = params[0].split("=")
		refunit = ''
		try {
			if (params[1].split("=")[0] == 'page') {
				offsetparam = params[1]
			}
		} catch {}
		try {
			if (params[2].split("=")[0] == 'page') {
				offsetparam = params[2]
			}
		}  catch {}
		try {
			if (params[1].split("=")[0] == 'refunit') {
				refunit = params[1].split("=")[1]
			}
		} catch {}
		try {
			if (params[2].split("=")[0] == 'refunit') {
				refunit = params[2].split("=")[1]
			}
		} catch {}
		try {
			offset = (offsetparam.split("=")[1] - 1) * 50
			}
		catch(err) {
			offset = 0
			}
		loadresults(id, offset, refunit)
		}
	else if (params[0].split("=")[0] == 'keyword') {
		if (params[1] == 'level=series'){
		keyword(params[0].split("=")[1], params[1].split("=")[1], start)
		}
		else {
		keyword(params[0].split("=")[1], '', start)
		}
	}
	else {
		$('#hide').show();
	}
	}

	$('#RG').keypress(function(enter){
		if(enter.keyCode==13)
		$('#RGinput').click();
		});
	$('#collection').keypress(function(enter){
		if(enter.keyCode==13)
		$('#Collinput').click();
		});
	$('#keyword').keypress(function(enter){
		if(enter.keyCode==13)
		$('#kyinput').click();
		});
		
	
	function keyword(keyword, level, start) {
		load();
		if (level === 'series'){
		var url = 'https://catalog.archives.gov/api/v1?rows=50&resultTypes=series&resultFields=num,naId,description.series.title,description.series.parentCollection,description.series.parentRecordGroup&q=' + keyword + '&offset=' + start*50;
		}
		else {
		var url = 'https://catalog.archives.gov/api/v1?rows=50&resultTypes=recordGroup,collection&q=' + keyword + '&offset=' + start*50;
		}
		$.getJSON(url, function(t) {
 			if (t.opaResponse.results.total > 0) {
 				seriestext = ''
 				if (level !== 'series') {
 					seriestext = '<p>You are currently searching only the text found in record group and collection descriptions. Didn\'t find what you\'re looking for? <strong><a href="' + window.location.pathname + '?keyword=' + keyword + '&level=series">Search using data from the series instead</a>.'
 					}
 				$('#front_matter').html('<p align="right"><small><a href="' + window.location.pathname + '">Return to search form</a></small></p></strong></p>' + seriestext + '<p>Displaying <strong>' + t.opaResponse.results.total + '</strong> results for this search, sorted automatically by relevance:</p>');
 			}
			else {
				$('#front_matter').html('<p align="right"><small><a href="' + window.location.pathname + '">Return to search form</a></small></p>There are <strong>0</strong> results for this search. Please try again.')
			}
			results = '';
		if (t.opaResponse.results.total > 0) {
			for (n = 0; n < t.opaResponse.results.result.length; n++) { 
				
				level = Object.keys(t.opaResponse.results.result[n].description)[0];
				try {
					start_year = t.opaResponse.results.result[n].description[level].inclusiveDates.inclusiveStartDate.year
				}
				catch(err) {
					start_year = '?'
				}
				try {
					end_year = t.opaResponse.results.result[n].description[level].inclusiveDates.inclusiveEndDate.year
				}
				catch(err) {
					end_year = 'present'
				}
				year_range = start_year + ' – ' + end_year;
				series = '<em>Series count</em>: <strong>' + t.opaResponse.results.result[n].description[level].seriesCount + '</strong>'
				if (level == 'collection') {
					id = t.opaResponse.results.result[n].description[level].collectionIdentifier;
					idtype = 'Collection Identifier';
					idparam = 'collection'
					title = t.opaResponse.results.result[n].description[level].title
					naid = t.opaResponse.results.result[n].naId;
					}
				if (level == 'recordGroup') {
					id = t.opaResponse.results.result[n].description[level].recordGroupNumber;
					idtype = 'Record Group Number';
					idparam = 'RG'
					title = t.opaResponse.results.result[n].description[level].title
					naid = t.opaResponse.results.result[n].naId
				}
				
				else if (level == 'series') {
					try {
						id = t.opaResponse.results.result[n].description[level].parentCollection.collectionIdentifier
						idtype = 'Collection Identifier'
						idparam = 'collection'
						title = t.opaResponse.results.result[n].description[level].parentCollection.title
						seriestitle = t.opaResponse.results.result[n].description[level].title
						seriestitle = t.opaResponse.results.result[n].description[level].title
						seriesnaid = t.opaResponse.results.result[n].naId
						series = '<em>Term found in series</em>: "<strong><a href="https://catalog.archives.gov/id/' + seriesnaid + '">' + seriestitle + '</a></strong>"'
						naid = t.opaResponse.results.result[n].description[level].parentCollection.naId
					} catch(err) {
						id = t.opaResponse.results.result[n].description[level].parentRecordGroup.recordGroupNumber
						idtype = 'Record Group Number'
						idparam = 'RG'
						title = t.opaResponse.results.result[n].description[level].parentRecordGroup.title
						seriestitle = t.opaResponse.results.result[n].description[level].title
						seriestitle = t.opaResponse.results.result[n].description[level].title
						seriesnaid = t.opaResponse.results.result[n].naId
						series = '<em>Term found in series</em>: "<strong><a href="https://catalog.archives.gov/id/' + seriesnaid + '">' + seriestitle + '</a></strong>"'
						naid = t.opaResponse.results.result[n].description[level].parentRecordGroup.naId
						}
				}
				
				results = results + ' <strong>&mdash;</strong> &nbsp; <a href="' + window.location.pathname + '?' + idparam + '=' + id +'">"<strong>' + title + '</strong>," ' + year_range + '</a><br/> &nbsp; &nbsp; &nbsp; &nbsp; <em>' + idtype + '</em>: <strong>' + id + '</strong>; &nbsp; <em>National Archives Identifier</em>: <a href="https://catalog.archives.gov/id/' + naid + '"><strong>' + naid + '</strong></a><br/> &nbsp; &nbsp; &nbsp; &nbsp; ' + series + '<br/><br/>'
			}
			}
			$('#table').html(results)
			if (start*50+50 >= t.opaResponse.results.total) { $('#searchnext').hide(); }
			else {$('#searchnext').show();}
		});
	}
	
	function loadresults(params, offset) {
	load();

	if (params[0] == 'RG') {
		var url = 'https://catalog.archives.gov/api/v1?description.recordGroup.recordGroupNumber=' + params[1];
		type = 'Record Group';
		APItype = 'recordGroup'
		}
	if (params[0] == 'collection') {
		var url = 'https://catalog.archives.gov/api/v1?description.collection.collectionIdentifier=' + params[1];
		type = 'Collection';
		APItype = 'collection'
		}
	$.getJSON(url, function(t) {
		if (t.opaResponse.results.total === 0) {
			$('#front_matter').html('There was no ' + type + ' "<strong>' + params[1] + '</strong>" found. <a href="' + window.location.pathname + '">Return to search form</a>.')
			$('#table').hide()
			}
		try {
			var id = t.opaResponse.results.result[0].description.recordGroup.recordGroupNumber
			}
		catch(err) {
			var id = t.opaResponse.results.result[0].description.collection.collectionIdentifier
			}
		var naid = t.opaResponse.results.result[0].naId;
		var title = t.opaResponse.results.result[0].description[APItype].title;
		try {
			startyear = t.opaResponse.results.result[0].description[APItype].inclusiveDates.inclusiveStartDate.year
		}
		catch(err) {
			startyear = '?'
		}
		try {
			endyear = t.opaResponse.results.result[0].description[APItype].inclusiveDates.inclusiveEndDate.year
		}
		catch(err) {
			endyear = '?'
		}
		try {
			var finding_aid = '<p><strong>Finding aid</strong>: &nbsp;&nbsp; ' + t.opaResponse.results.result[0].description[APItype].findingAidArray.findingAid.note + '</p>'
		}
		catch(err) {
			var finding_aid = ''
		}
		var series_count = t.opaResponse.results.result[0].description[APItype].seriesCount
		var reference_unit_array = [];
		var reference_unit_array = reference_unit_array.concat(t.opaResponse.results.result[0].description[APItype].referenceUnits.referenceUnit)
		var reference_units = 'Overview of record locations (select to filter):'
		for (n = 0; n < reference_unit_array.length; n++) {
			if (reference_unit_array[n].naId == refunit) { 
				var reference_units = reference_units + '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&bull; <strong><a href="' + window.location.pathname + '?' + params[0] + '=' + params[1] + '&refunit=' + reference_unit_array[n].naId + '">' + reference_unit_array[n].name + ' (' + reference_unit_array[n].mailCode + ')</a></strong>'
			}
			else {
				var reference_units = reference_units + '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&bull; <a href="' + window.location.pathname + '?' + params[0] + '=' + params[1] + '&refunit=' + reference_unit_array[n].naId + '">' + reference_unit_array[n].name + ' (' + reference_unit_array[n].mailCode + ')</a>'
				}
			}
		$('#front_matter').html('<p align="right"><small><a href="' + window.location.pathname + '">Return to search form</a></small></p><h1>' + title + '</h1><p><strong><a href="https://catalog.archives.gov/id/' + naid + '">' + type + ' ' + id + '</a></strong><br/><em>' + startyear + ' – ' + endyear + '</em><br/><br/><p>This ' + type + ' contains <strong>' + series_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</strong> series.</p>' + reference_units + '</p><h2>Administrative history</h2><p><strong>Records in this ' + type + ' cover the following dates</strong>: &nbsp;&nbsp; ' + startyear + '&ndash;' + endyear + '</p>');

		function creatorlist(cursor) {
		$.ajax({
			url: 'https://catalog.archives.gov/api/v1?description.series.parentRecordGroup.recordGroupNumber=' + params[1] + '&resultFields=description.series.creatingOrganizationArray.creatingOrganization.creator.termName,description.series.creatingOrganizationArray.creatingOrganization.creator.naId&rows=100&cursorMark=' + cursor,
			method: 'GET',
			contentType: 'json',
			async: false,
			success: function(t) {
				creatornaids = []
				creatortitles = []
				for (f=0;f<t.opaResponse.results.result.length;f++){
					try {
						creatornaid = t.opaResponse.results.result[f].description.series.creatingOrganizationArray.creatingOrganization.creator.naId
						creatortitle = t.opaResponse.results.result[f].description.series.creatingOrganizationArray.creatingOrganization.creator.termName
						if (creatornaids.includes(creatornaid) === false) {
							creatornaids.push(creatornaid)
							creatortitles.push(creatortitle)
						}
					}
					catch(err){
						creatornaid = t.opaResponse.results.result[f].description.series.creatingOrganizationArray.creatingOrganization[0].creator.naId
						creatortitle = t.opaResponse.results.result[f].description.series.creatingOrganizationArray.creatingOrganization[0].creator.termName
						if (creatornaids.includes(creatornaid) === false) {
							creatornaids.push(creatornaid)
							creatortitles.push(creatortitle)
						}
					}
				}
				creators = []
				for (f=0;f<creatornaids.length;f++){
					creators.push([creatortitles[f],creatornaids[f]])
				}
				creators.sort()
				creator=[]
				for (x=0;x<creators.length;x++){
					creator.push('<a href="https://catalog.archives.gov/id/' + creators[x][1] + '">' + creators[x][0] + '</a>')
				}
				newcursor = t.opaResponse.results.nextCursorMark
				total = t.opaResponse.results.total
				return [newcursor, total, creatornaids, creatortitles]
			}
		});
		return [newcursor, total, creatornaids, creatortitles]
		}
		
		cursor = creatorlist('*')
		findnaids = cursor[2]
		sortedcreators = []
		for (y = 0; y < cursor[2].length; y++) {
			sortedcreators.push([cursor[3][y],cursor[2][y]])
		}
		for (n = 100; n < cursor[1]; n += 100) {
			cursor = creatorlist(cursor[0])
			for (y = 0; y < cursor[2].length; y++) {
				if (findnaids.includes(cursor[2][y]) === false) {
					findnaids.push(cursor[2][y])
					sortedcreators.push([cursor[3][y],cursor[2][y]])
					}
			}
		}
		sortedcreators.sort()

if (refunit !== '') {
	refunit = '&description.series.physicalOccurrenceArray.seriesPhysicalOccurrence.referenceUnitArray.referenceUnit.naId=' + refunit
	}
	table = '<button style="color: darkblue" id="showall">[&#x25BC;expand all]</button>'
	for (b = 0; b < sortedcreators.length; b++) {
	table = table + '<table width="100%" border="1">'
seriesurl = 'https://catalog.archives.gov/api/v1?description.series.creatingOrganizationArray.creatingOrganization.creator.naId=' + sortedcreators[b][1] + '&resultFields=num,naId,description.series.creatingIndividualArray,description.series.creatingOrganizationArray,description.series.physicalOccurrenceArray,description.series.inclusiveDates,description.series.fileUnitCount,description.series.itemCount,description.series.itemAvCount,description.series.title&sort=titleSort asc&rows=50&description.series.parent' + APItype.replace(/^\w/, c => c.toUpperCase()) + '.naId=' + naid + '&offset=' + offset + refunit

table = table + '<tr><th width="100%" colspan="7"><br/><center><a href="https://catalog.archives.gov/id/' + sortedcreators[b][1] + '">' + sortedcreators[b][0] + '</a></center><button style="color: darkblue" class="showseries" value="' + sortedcreators[b][1] + '">[&#x25BC;expand]</button></th></tr></table><table style="display: none" width="100%" border="1" class="showheader" id="' + sortedcreators[b][1] +'" ><tr><th width="30%" rowspan="2"><center>Series</center></th><th width="10%" rowspan="2"><center>National Archives Identifier</center></th><th rowspan="2" width="12%"><center>Date range</center></th><th width="17%" rowspan="2"><center>Extent</center></th><th width="21%" rowspan="2"><center>Location</center></th><th colspan="2"><center>Records</center></th></tr><tr><th width="5%"><center>File units&nbsp; &nbsp;</center></th><th width="5%"><center>&nbsp; &nbsp;Items&nbsp; &nbsp;</center></th></tr>'
		newtablecontent = ''
        newtablecontent = loadcreator(seriesurl)
		table = table + newtablecontent + '</table>'
		}
	
	$('#table').html(table)

	});
	}
		$(document).on('click', ".showseries", function() {
			$("#" + $(this).attr("value")).show()
		});
		
		$(document).on('click', "#showall", function() {
			for (z=0;z<sortedcreators.length;z++) {
				$("#" + sortedcreators[z][1]).show()
			}
		});
	
		function loadcreator(seriesurl) {
		addtable = ''
		$.ajax({
			url: seriesurl,
			method: 'GET',
			contentType: 'json',
			async: false,
			success: function(s){	

		rows = ''
		for (n = 0; n < s.opaResponse.results.result.length; n++) {
			
			try {
				try {
					creator_naid = s.opaResponse.results.result[n].description.series.creatingOrganizationArray.creatingOrganization.creator.naId;
					creator_name = s.opaResponse.results.result[n].description.series.creatingOrganizationArray.creatingOrganization.creator.termName;
				}
				catch (err) {
					creator_naid = s.opaResponse.results.result[n].description.series.creatingOrganizationArray.creatingOrganization[0].creator.naId;
					creator_name = s.opaResponse.results.result[n].description.series.creatingOrganizationArray.creatingOrganization[0].creator.termName;
				}
			}
			catch(err) {
				try {
					creator_naid = s.opaResponse.results.result[n].description.series.creatingIndividualArray.creatingIndividual.creator.naId;
					creator_name = s.opaResponse.results.result[n].description.series.creatingIndividualArray.creatingIndividual.creator.termName;
				}
				catch (err) {
					creator_naid = s.opaResponse.results.result[n].description.series.creatingIndividualArray.creatingIndividual[0].creator.naId;
					creator_name = s.opaResponse.results.result[n].description.series.creatingIndividualArray.creatingIndividual[0].creator.termName
				}
			}
			result_title = s.opaResponse.results.result[n].description.series.title;
			result_naid = s.opaResponse.results.result[n].naId;
			try {
				result_startyear = s.opaResponse.results.result[n].description.series.inclusiveDates.inclusiveStartDate.year
		}
			catch(err) {
				result_startyear = '?'
		}
			try {
				result_endyear = s.opaResponse.results.result[n].description.series.inclusiveDates.inclusiveEndDate.year
		}
			catch(err) {
				result_endyear = '?'
		}
			try {
				result_extent = s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence.extent;
				result_referenceunit = s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence.referenceUnitArray.referenceUnit.name;
			}
			catch(err) {
				multiextent = '';
				multireferenceunit = '';
				for (l = 0; l < s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence.length; l++) {
				if ((l == 0) || ((l > 0) && (s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l].extent !== s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l - 1].extent))) {
					multiextent = multiextent + s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l].extent + '<br/>'
					}
				if ((l == 0) || ((l > 0) && (s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l].referenceUnitArray.referenceUnit.name !== s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l - 1].referenceUnitArray.referenceUnit.name))) {
					multireferenceunit = multireferenceunit + s.opaResponse.results.result[n].description.series.physicalOccurrenceArray.seriesPhysicalOccurrence[l].referenceUnitArray.referenceUnit.name + '<br/>'
				}
				}
				result_extent = multiextent;
				result_referenceunit = multireferenceunit
			}
			result_fileunits = s.opaResponse.results.result[n].description.series.fileUnitCount;
			result_items = Number(s.opaResponse.results.result[n].description.series.itemCount) + Number(s.opaResponse.results.result[n].description.series.itemAvCount)

			addtable = addtable + '\
			<tr width="100%" style="border: 0" valign="mid"><td width="30%"><strong><a href="https://catalog.archives.gov/id/' + result_naid + '">' + result_title + '</a></td><td width="10%"><center>' + result_naid + '</center></td><td width="12%">' + result_startyear + ' – ' + result_endyear + '</td><td width="17%">' + result_extent + '</td><td width="21%">' + result_referenceunit + '</td><td width="5%"><center>' + result_fileunits + '</center></td><td width="5%"><center>' + result_items + '</center></td></tr>\
			'
			
		}
		return addtable
		unittext = ''
		series_count = s.opaResponse.results.total
		if (refunit !== '') {
// 			unittext = '<p>Now displaying <strong>' + series_count + '</strong> series from your selected reference unit.</p><br/>'
		}
// 		$('#table').append(unittext + '<table width="100%" border="1"><tr><th width="40%"  colspan="6"><center>Creator: <a href="https://catalog.archives.gov/id/' + sortedcreators[b][1] + '">' + sortedcreators[b][0] + '</a></th></tr>' + rows)
		page = (offset / 50) + 1
	if (series_count > 50) {
		if (series_count > 10000) {
			last = 200;
			}
		else {
			last = Math.ceil(series_count / 50);
			if (last == (series_count/50)) {
				last = last - 1;
			}
		}
		pages = '';
		if (page <= 5) {
			for (q = 1; (q <= last) && (q < 10); q++) {
				if (q == page) {
					pages = pages + '\
					<li class="active"><span>' + q + '</span></li>'
				}
				else {
					pages = pages + '\
<li><a title="Go to page ' + q + '" href="./?' + params.join("=") + '&page=' + q + '">' + q + '</a></li>'
				}
			}
			if (page < (last-8)) {
				pages = pages + '\
<li class="pager-ellipsis disabled"><span>…</span></li>'
				}
		}
		if ((page >= 6) && (page < (last-8))) {
			pages = pages + '\
<li class="pager-ellipsis disabled"><span>…</span></li>'
			for (q = (page-4); (q <= last) && (q <= (page+4)); q++) {
				if (q == page) {
					pages = pages + '\
					<li class="active"><span>' + q + '</span></li>'
				}
				else {
					pages = pages + '\
<li><a title="Go to page ' + q + '" href="./?' + params.join("=") + '&page=' + q + '">' + q + '</a></li>'
				}
			}
			pages = pages + '\
<li class="pager-ellipsis disabled"><span>…</span></li>'
		}
		if ((page >= 6) && (page > (last-8))) {
			pages = pages + '\
<li class="pager-ellipsis disabled"><span>…</span></li>'
			for (q = (page-(8-(last-page))); q <= last; q++) {
				if (q == page) {
					pages = pages + '\
					<li class="active"><span>' + q + '</span></li>'
				}
				else {
					pages = pages + '\
<li><a title="Go to page ' + q + '" href="./?' + params.join("=") + '&page=' + q + '">' + q + '</a></li>'
				}
			}
		}
		$('#searchwithin').show()
		firstprev = '';
		if (page != 1) {
			firstprev = '\
<li class="first"><a href="./?' + params.join("=") + '&page=1">first</a></li>\
<li class="next"><a href="./?' + params.join("=") + '&page=' + (page-1) + '">previous</a></li>'
		}
		nextlast = ''
		if (page != last) {
			nextlast = '\
<li class="next"><a href="./?' + params.join("=") + '&page=' + (page+1) + '">next</a></li>\
<li class="pager-last"><a href="./?' + params.join("=") + '&page=' + last + '">last</a></li>'
		}
		$('#toppagination').html('<h2>Records</h2>\
		<div class="dynamic-widget"><div class="toppagination"><div class="text-center"><br/><ul class="pagination">' + firstprev + pages + nextlast + '\
</ul></div></div></div>')
		$('#bottompagination').html('</table>\
		<div class="dynamic-widget"><div class="toppagination"><div class="text-center"><br/><ul class="pagination">' + firstprev + pages + nextlast + '\
</ul></div></div></div>')
	}
	else {
	$('#toppagination').html('<h2>Records</h2>')
		$('#bottompagination').html('</table>')
	}
	}
		});
		return addtable
		}
load = function() {
$('#table').html('<center><img width="300px" src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Lightness_rotate_36f_cw.gif"> <h1>Loading time: <span id="seconds"></span> seconds.</h1></center>')
$('html, body').animate({ scrollTop: 0 }, 'medium');
window.setInterval((function(){
   var start = Date.now();
   var textNode = document.createTextNode('0');
   document.getElementById('seconds').appendChild(textNode);
   return function() {
        textNode.data = Math.floor((Date.now()-start).toFixed(3))/1000;
        };
   }()), 1);
}

	$("#RGinput").click(function(event){
		RG = $('#RG').val();
	
		var url = window.location.pathname;
		newParam="?RG=" + RG;
		newUrl=url.replace(newParam,"");
		newUrl+=newParam;
		window.location.href = newUrl;
	
		});

	$("#Collinput").click(function(event){
		collection = $('#collection').val();
	
		var url = window.location.pathname;
		newParam="?collection=" + collection;
		newUrl=url.replace(newParam,"");
		newUrl+=newParam;
		window.location.href = newUrl;
	
	});

	$("#kyinput").click(function(event){
		keyword = $('#keyword').val();
	
		var url = window.location.pathname;
		newParam="?keyword=" + keyword;
		newUrl=url.replace(newParam,"");
		newUrl+=newParam;
		window.location.href = newUrl;
	
	});
	start = 0;
	$("#nextpage").click(function(event){
		start = start + 1;
		if (params[1] == 'level=series'){
		keyword(params[0].split("=")[1], params[1].split("=")[1], start)
		}
		else {
		keyword(params[0].split("=")[1], '', start)
		}
		$('#searchprev').show();
	});
	$("#prevpage").click(function(event){
		start = start - 1
		if (params[1] == 'level=series'){
		keyword(params[0].split("=")[1], params[1].split("=")[1], start)
		}
		else {
		keyword(params[0].split("=")[1], '', start)
		}
		if (start = 0) { $('#searchprev').hide();}
	});
	
 });