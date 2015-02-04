function verify_reject() {
   return confirm('Are you sure you want to close this patch as Rejected?\n\nThis should only be done when a patch will never be applied - if more work is needed, it should instead be set to "Returned with Feedback".\n\nSo - are you sure?');
}
function verify_returned() {
   return confirm('Are you sure you want to close this patch as Returned with Feedback?\n\nThis means the patch will be marked as closed in this commitfest, but will automatically be moved to the next one. If no further work is expected on this patch, it should be closed with "Rejected" istead.\n\nSo - are you sure?');
}

function findLatestThreads() {
   $('#attachThreadListWrap').addClass('loading');
   $('#attachThreadSearchButton').addClass('disabled');
   $.get('/ajax/getThreads/', {
      's': $('#attachThreadSearchField').val(),
      'a': $('#attachThreadAttachOnly').val(),
   }).success(function(data) {
         sel = $('#attachThreadList');
         sel.find('option').remove();
         $.each(data, function(m,i) {
            sel.append('<option value="' + i.msgid + '">' + i.from + ': ' + i.subj + ' (' + i.date + ')</option>');
         });
   }).always(function() {
      $('#attachThreadListWrap').removeClass('loading');
      $('#attachThreadSearchButton').removeClass('disabled');
      attachThreadChanged();
   });
   return false;
}

function browseThreads(attachfunc, closefunc) {
   $('#attachThreadList').find('option').remove();
   $('#attachThreadMessageId').val('');
   $('#attachModal').off('hidden.bs.modal');
   $('#attachModal').on('hidden.bs.modal', function(e) {
       if (closefunc) closefunc();
   });
   $('#attachModal').modal();
   findLatestThreads();

   $('#doAttachThreadButton').unbind('click');
   $('#doAttachThreadButton').click(function() {
      msgid = $('#attachThreadMessageId').val();
      if (!msgid || msgid == '') {
         msgid = $('#attachThreadList').val();
         if (!msgid) return;
      }

      $('#attachThreadListWrap').addClass('loading');
      $('#attachThreadSearchButton').addClass('disabled');
      $('#attachThreadButton').addClass('disabled');
      if (attachfunc(msgid)) {
         $('#attachModal').modal('hide');
      }
      $('#attachThreadListWrap').removeClass('loading');
      $('#attachThreadSearchButton').removeClass('disabled');
      attachThreadChanged();
   });

}

function attachThread(cfid, patchid, closefunc) {
   browseThreads(function(msgid) {
      doAttachThread(cfid, patchid, msgid, !closefunc);
      if (closefunc) {
	  /* We don't really care about closing it, we just reload immediately */
	  closefunc();
      }
   },
   function() {
      if (closefunc) closefunc();
   });
}

function detachThread(cfid, patchid, msgid) {
   if (confirm('Are you sure you want to detach the thread with messageid "' + msgid + '" from this patch?')) {
      $.post('/ajax/detachThread/', {
         'cf': cfid,
         'p': patchid,
         'msg': msgid,
      }).success(function(data) {
         location.reload();
      }).fail(function(data) {
         alert('Failed to detach thread!');
      });
   }
}

function attachThreadChanged() {
   if ($('#attachThreadList').val() || $('#attachThreadMessageId').val()) {
      $('#doAttachThreadButton').removeClass('disabled');
   }
   else {
      $('#doAttachThreadButton').addClass('disabled');
   }
}

function doAttachThread(cfid, patchid, msgid, reloadonsuccess) {
   $.post('/ajax/attachThread/', {
      'cf': cfid,
      'p': patchid,
      'msg': msgid,
   }).success(function(data) {
      if (data != 'OK') {
	  alert(data);
      }
      if (reloadonsuccess)
	  location.reload();
      return true;
   }).fail(function(data) {
      if (data.status == 404) {
         alert('Message with messageid ' + msgid + ' not found');
      }
      else if (data.status == 503) {
         alert('Failed to attach thread: ' + data.responseText);
      }
      else {
         alert('Failed to attach thread: ' + data.statusText);
      }
      return false;
   });
}

function flagCommitted(committer) {
   $('#commitModal').modal();
   $('#committerSelect').val(committer);
   $('#doCommitButton').unbind('click');
   $('#doCommitButton').click(function() {
       var c = $('#committerSelect').val();
       if (!c) {
	   alert('You need to select a committer before you can mark a patch as committed!');
	   return;
       }
       document.location.href='close/committed/?c=' + c;
   });
   return false;
}


function sortpatches(sortby) {
   $('#id_sortkey').val(sortby);
   $('#filterform').submit();

   return false;
}

function toggleButtonCollapse(buttonId, collapseId) {
   $('#' + buttonId).button('toggle');
   $('#' + collapseId).toggleClass('in')
}

function togglePatchFilterButton(buttonId, collapseId) {
   /* Figure out if we are collapsing it */
   if ($('#' + collapseId).hasClass('in')) {
       /* Go back to ourselves without a querystring to reset the form, unless it's already empty */
       if (document.location.href.indexOf('?') > -1) {
	   document.location.href = '.';
	   return;
       }
   }

   toggleButtonCollapse(buttonId, collapseId);
}


/*
 * Upstream user search dialog
 */
function search_and_store_user() {
    $('#doSelectUserButton').unbind('click');
    $('#doSelectUserButton').click(function() {
	if (!$('#searchUserList').val()) { return false; }

	/* Create this user locally */
	$.get('/ajax/importUser/', {
	    'u': $('#searchUserList').val(),
	}).success(function(data) {
	    if (data == 'OK') {
		alert('User imported!');
		$('#searchUserModal').modal('hide');
	    } else {
		alert('Failed to import user: ' + data);
	    }
	}).fail(function(data, statustxt) {
	    alert('Failed to import user: ' + statustxt);
	});

	return false;
    });

    $('#searchUserModal').modal();
}

function findUsers() {
    if (!$('#searchUserSearchField').val()) {
	alert('No search term specified');
	return false;
    }
    $('#searchUserListWrap').addClass('loading');
    $('#searchUserSearchButton').addClass('disabled');
    $.get('/ajax/searchUsers/', {
      's': $('#searchUserSearchField').val(),
    }).success(function(data) {
        sel = $('#searchUserList');
        sel.find('option').remove();
        $.each(data, function(i,u) {
	    sel.append('<option value="' + u.u + '">' + u.u + ' (' + u.f + ' ' + u.l + ')</option>');
        });
    }).always(function() {
	$('#searchUserListWrap').removeClass('loading');
	$('#searchUserSearchButton').removeClass('disabled');
	searchUserListChanged();
    });
   return false;
}

function searchUserListChanged() {
   if ($('#searchUserList').val()) {
       $('#doSelectUserButton').removeClass('disabled');
   }
   else {
       $('#doSelectUserButton').addClass('disabled');
   }
}
