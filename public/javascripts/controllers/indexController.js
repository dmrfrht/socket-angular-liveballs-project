app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {

  $scope.messages = []

  $scope.players = {}

  $scope.init = () => {
    const userName = prompt("Please enter username")

    if (userName) initSocket(userName)
    else return false
  }

  function scrollTop() {
    setTimeout(() => {
      const element = document.getElementById('chat-area')
      element.scrollTop = element.scrollHeight
    })
  }

  function showBubble(id, message) {
    $('#' + id).find('.message').show().html(message)

    setTimeout(() => {
      $('#' + id).find('.message').hide()
    }, 4000)
  }

  function initSocket(userName) {
    const connectionOptions = {
      reconnectionAttempts: 3,
      reconnectionDelay: 600
    }

    indexFactory.connectSocket('http://localhost:3000', connectionOptions)
      .then((socket) => {
        socket.emit('newuser', {userName})

        socket.on('initPlayers', users => {
          $scope.players = users
          $scope.$apply()
        })

        socket.on('newUser', data => {
          const messageData = {
            type: {
              code: 0,
              message: 1
            },
            userName: data.userName
          }

          $scope.messages.push(messageData)
          $scope.players[data.id] = data
          scrollTop()
          $scope.$apply()
        })

        socket.on('disUser', data => {
          const messageData = {
            type: {
              code: 0,
              message: 0
            },
            userName: data.userName
          }

          $scope.messages.push(messageData)
          delete $scope.players[data.id]
          scrollTop()
          $scope.$apply()
        })

        socket.on('animate', (data) => {
          $('#' + data.socketId).animate({'left': data.x, 'top': data.y}, () => {
            animate = false
          })
        })

        socket.on('newMessage', message => {
          $scope.messages.push(message)
          $scope.$apply()
          showBubble(message.socketId, message.text)
          scrollTop()
        })

        let animate = false
        $scope.onClickPlayer = ($event) => {
          if (!animate) {
            let x = $event.offsetX
            let y = $event.offsetY

            socket.emit('animate', {x, y})

            animate = true
            $('#' + socket.id).animate({'left': x, 'top': y}, () => {
              animate = false
            })
          }
        }

        $scope.newMessage = () => {
          let message = $scope.message
          const messageData = {
            type: {
              code: 1
            },
            userName,
            text: message
          }

          $scope.messages.push(messageData)
          $scope.message = ''

          socket.emit('newMessage', messageData)

          showBubble(socket.id, message)
          scrollTop()
        }
      })
      .catch((error) => console.log(error))
  }
}])
