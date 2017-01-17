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
    $.post({
      url: '/restore_web',
      data: {
        commit_id: commit,
        path: path
      }
    }).done(function (data) {
      console.log(data)
      toastr.info(data)
      window.setTimeout(function () {
        window.location.reload()
      }, 5000)
	})
}

function diff_web (e) {
    e.preventDefault()
    swal({
      title: "N'estas segur?",
      text: 'You will not be able to recover this imaginary file!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Si, recupera\'l',
      cancelButtonText: 'Cancela',
      closeOnConfirm: true
    }, function () {
        let commit = $(e.currentTarget).attr('tag')
        let path = $('#path').text()
        $.post({
          url: '/show_diff_web',
          data: {
            commit_id: commit,
            path: path
        }
        }).done(function (data) {
          console.log(data.missatge)
          console.log(data.result)
          $(e.currentTarget).append(data.result)
          toastr.info(data.missatge)
          window.setTimeout(function () {
            window.location.reload()
          }, 5000)
        })
      swal('Hem recuperat el fitxer al seu estat anterior', 'success')
    })
}

function diff_tree_web(e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let path = $('#path').text()
    $.post({
      url: '/show_diff_tree_web',
      data: {
        commit_id: commit,
        path: path
      }
    }).done(function(data){
		console.log(data.missatge)
		console.log(data.result)
		$(e.currentTarget).append(data.result)
		toastr.info(data.missatge)
      window.setTimeout(function () {
        window.location.reload()
      }, 5000)
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
      }, 5000)
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
      }, 5000)
	})
}

function restore_file(e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
	let full_path = $('#path').text()
	let full_path_splitted = full_path.split('/')
    let nom_web = full_path_splitted[2]
	let file = full_path_splitted[full_path_splitted.length-1]
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
      window.setTimeout(function () {
        window.location.reload()
      }, 5000)
	})
}