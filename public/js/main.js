jQuery(document).ready(function ($) {
  var timelineBlocks = $('.cd-timeline-block'),
    offset = 0.8

	// hide timeline blocks which are outside the viewport
  hideBlocks(timelineBlocks, offset)

	// on scolling, show/animate timeline blocks when enter the viewport
  $(window).on('scroll', function () {
    (!window.requestAnimationFrame)
			? setTimeout(function () { showBlocks(timelineBlocks, offset) }, 100)
			: window.requestAnimationFrame(function () { showBlocks(timelineBlocks, offset) })
  })

  function hideBlocks (blocks, offset) {
    blocks.each(function () {
      ($(this).offset().top > $(window).scrollTop() + $(window).height() * offset) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden')
    })
  }

  function showBlocks (blocks, offset) {
    blocks.each(function () {
      ($(this).offset().top <= $(window).scrollTop() + $(window).height() * offset && $(this).find('.cd-timeline-img').hasClass('is-hidden')) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in')
    })
  }
})



function restore_web(e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let path = $('#path').text()
    swal({
      title: "N'estas segur?",
      text: 'Vigila restaurant webs, és possible perdre\'n l\'estat actual',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Si, recupera\'l',
      cancelButtonText: 'Cancela',
      closeOnConfirm: true
    }, function () {
		$.post({
			url: '/restore_web',
			data: {
				commit_id: commit,
				path: path
			}
		}).done(function (data) {
            window.setTimeout(function() {
                window.location.reload()
            }, 1000)
        })
    })
}

function parseText(data){
    let html=""
    let array = data.split('\n')
    for (i = 0; i < array.length; i++)
        html += array[i] + "</br>"
    return html
}

function back(e){
	e.preventDefault()
	let path = $('#path').text()
	$.post({
			url: '/back',
			data: {
				commit_id: commit,
				path: path
			}
		}).done(function (data) {
			  console.log(data)
			  toastr.info(data)
			  swal('Hem recuperat el fitxer al seu estat anterior', 'success')
			window.setTimeout(function () {
				window.location.reload()
			}, 1000)
		})
}

function selectLines (current, index) {
    if (current[0] == '+') current = "<span style='color: green'>"+current+"<span>"
    else if (current[0] == '-') current = "<span style='color: red'>"+current+"<span>"
}

function close_panel(e){
	e.preventDefault()
	let target = $(e.currentTarget)
	let commit = target.attr('tag')
    let panel = $('#panel_' + commit)
	if (!panel.hasClass('hidden')){
		panel.addClass('hidden')
	}
	target.addClass('hidden')
}

function diff_web (e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let panel = $('#panel_' + commit)
    let path = $('#path').text()
	let close_btn = $('#close_' + commit)

	$.post({
		url: '/diff_web',
		data: {
			commit_id: commit,
			path: path
		}
	}).done(function (data) {
		console.log(data.missatge)
		if (!data.result)
			panel.html('No hi ha cap canvi visible')
		else {
			console.log(data.result.split('\n').map(selectLines))
			panel.html(data.result)
		}
		panel.removeClass('hidden')
		toastr.info(data.missatge)
		close_btn.removeClass('hidden')

		/*window.setTimeout(function () {
			window.location.reload()
		}, 5000)*/
	})
	
}

function show_web (e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let panel = $('#panel_' + commit)
    let path = $('#path').text()
	let close_btn = $('#close_' + commit)
	$.post({
		url: '/show_web',
		data: {
			commit_id: commit,
			path: path
		}
	}).done(function (data) {
		console.log(data.missatge)
		if (!data.result)
			panel.html('No hi ha cap canvi visible')
		else {
			console.log(data.result.split('\n').map(selectLines))
            parseText(data.result)
			panel.html(data.result)
		}
		panel.removeClass('hidden')
		toastr.info(data.missatge)
		close_btn.removeClass('hidden')

		/*window.setTimeout(function () {
			window.location.reload()
		}, 5000)*/
	})
}

function diff_tree_web(e) {
	e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let panel = $('#panel_' + commit)
    let path = $('#path').text()
	let close_btn = $('#close_' + commit)
	$.post({
		url: '/diff_tree_web',
		data: {
			commit_id: commit,
			path: path
		}
	}).done(function (data) {
		console.log(data.missatge)
		if (!data.result)
			panel.html('No hi ha cap canvi visible')
		else {
			console.log(data.result.split('\n').map(selectLines))
			panel.html(data.result)
		}
		panel.removeClass('hidden')
		toastr.info(data.missatge)
		close_btn.removeClass('hidden')
	})
}

function backup_web(e){
	e.preventDefault()
    let path = $('#path').text()
    $.post({
      url: '/backup_web',
      data: {
        path: path
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
      window.setTimeout(function () {
        window.location.reload()
      }, 1000)
	})
}

function undo_restore_web(e) {
	e.preventDefault()
    let path = $('#path').text()
    $.post({
      url: '/undo_restore_web',
      data: {
        path: path
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
      window.setTimeout(function () {
        window.location.reload()
      }, 1000)
	})
}

function backup_file(e){
	e.preventDefault()
	let full_path = $('#path').text()
	let full_path_splitted = full_path.split('/')
	let nom_web = full_path_splitted[2]
	let file = full_path_splitted[full_path_splitted.length-1]
    $.post({
      url: '/backup_file',
      data: {
        path: full_path,
		nom_web: nom_web,
        file_name: file
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
      window.setTimeout(function () {
        window.location.reload()
      }, 1000)
	})
}

function restore_file(e) {
    e.preventDefault()
	let commit = $(e.currentTarget).attr('tag')
	let full_path = $('#path').text()
	let full_path_splitted = full_path.split('/')
	let nom_web = full_path_splitted[2]
	let file = full_path_splitted[full_path_splitted.length-1]
    swal({
      title: "N'estas segur?",
      text: 'Vigila restaurant fitxers, és possible perdre\'n l\'estat actual',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Si, recupera\'l',
      cancelButtonText: 'Cancela',
      closeOnConfirm: true
    }, function () {
        $.post({
        url: '/restore_file',
        data: {
            commit_id: commit,
            nom_web: nom_web,
            file_name: file
        }
        }).done(function(data){
            console.log(data)
            toastr.info(data)
            swal('Hem recuperat el fitxer al seu estat anterior', 'success')
            window.setTimeout(function () {
                window.location.reload()
            }, 1000)
        })
    })
}

function diff_file(e) {
	e.preventDefault()
	let commit = $(e.currentTarget).attr('tag')
	let full_path = $('#path').text()
	let full_path_splitted = full_path.split('/')
	let nom_web = full_path_splitted[2]
	let panel = $('#panel_' + commit)
    let path = $('#path').text()
	let file = full_path_splitted[full_path_splitted.length-1]
	let close_btn = $('#close_' + commit)

	$.post({
		url: '/diff_file',
		data: {
			commit_id: commit,
			nom_web: nom_web,
			file_name: file
		}
	}).done(function (data) {
		console.log(data.message)
		if (!data.result)
			panel.html('No hi ha cap canvi visible')
		else {
			console.log(data.result.split('\n').map(selectLines))
			panel.html(data.result)
		}
		panel.removeClass('hidden')
		toastr.info(data.missatge)
		close_btn.removeClass('hidden')

		/*window.setTimeout(function () {
			window.location.reload()
		}, 5000)*/
	})
}

function show_file(e) {
	e.preventDefault()
	let commit = $(e.currentTarget).attr('tag')
	let full_path = $('#path').text()
	let full_path_splitted = full_path.split('/')
	let nom_web = full_path_splitted[2]
	let panel = $('#panel_' + commit)
    let path = $('#path').text()
	let file = full_path_splitted[full_path_splitted.length-1]
	let close_btn = $('#close_' + commit)
    
	$.post({
		url: '/show_file',
		data: {
			commit_id: commit,
			nom_web: nom_web,
			file_name: file
		}
	}).done(function (data) {
		console.log(data.missatge)
		if (!data.result)
			panel.html('No hi ha cap canvi visible')
		else {
			console.log(data.result.split('\n').map(selectLines))
			panel.html(data.result)
		}
		panel.removeClass('hidden')
		toastr.info(data.missatge)
		close_btn.removeClass('hidden')

		/*window.setTimeout(function () {
			window.location.reload()
		}, 5000)*/
	})
}
