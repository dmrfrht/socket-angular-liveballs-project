app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {

  $scope.messages = []

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
        socket.emit('newuser', { userName })
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
      })
      .catch((error) => console.log(error))
  }
}])
