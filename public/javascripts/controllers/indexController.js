app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {

  $scope.messages = []

  $scope.players = {}

  $scope.init = () => {
    const userName = prompt("Please enter username")

    if (userName) initSocket(userName)
    else return false
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
          $scope.$apply()
        })

        socket.on('disUser', user => {
          const messageData = {
            type: {
              code: 0,
              message: 0
            },
            userName: user.userName
          }

          $scope.messages.push(messageData)
          $scope.$apply()
        })

        let animate = false
        $scope.onClickPlayer = ($event) => {
          if (!animate) {
            animate = true
            $('#' + socket.id).animate({'left': $event.offsetX, 'top': $event.offsetY}, () => {
              animate = false
            })
          }

        }
      })
      .catch((error) => console.log(error))
  }
}])
