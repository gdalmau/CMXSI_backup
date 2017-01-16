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
	
  $('.restore').on('click', function (e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let path = $('#path').text()
    $.post({
      url: '/restore',
      data: {
        commit_id: commit,
        path: path
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
		setTimeout(location.reload(),5000)
	})
  })
  
  $('.diff').on('click', function (e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let path = $('#path').text()
    $.post({
      url: '/show_diff',
      data: {
        commit_id: commit,
        path: path
      }
    }).done(function(data){
		console.log(data.missatge)
		console.log(data.result)
		$(e.currentTarget).append(data.result)
		toastr.info(data.missatge)
		// setTimeout(location.reload(),5000)
	})
  })
  
  $('.diff_tree').on('click', function (e) {
    e.preventDefault()
    let commit = $(e.currentTarget).attr('tag')
    let path = $('#path').text()
    $.post({
      url: '/show_diff_tree',
      data: {
        commit_id: commit,
        path: path
      }
    }).done(function(data){
		console.log(data.missatge)
		console.log(data.result)
		$(e.currentTarget).append(data.result)
		toastr.info(data.missatge)
		// setTimeout(location.reload(),5000)
	})
  })
})

function backup_web(e){
	e.preventDefault()
    let path = $('#path').text()
    $.post({
      url: '/backup',
      data: {
        path: path
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
		setTimeout(location.reload(),5000)
	})
}

function undo_restore(e){
	e.preventDefault()
    let path = $('#path').text()
    $.post({
      url: '/undo_restore',
      data: {
        path: path
      }
    }).done(function(data){
		console.log(data)
		toastr.info(data)
		setTimeout(location.reload(),5000)
	})
}