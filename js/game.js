angular.module('Corrupcao', []);
angular.module('Corrupcao').config(['$controllerProvider', function($controllerProvider) {
    $controllerProvider.allowGlobals();
}]);
angular.module('Corrupcao').service('game', Game);
angular.module('Corrupcao').service('data', Data);

function Game(data){

    this.money = 0;
    this.moneyPs = 0;
    this.moneyPc = 1;
    this.totalMoney = 0;
    this.cargo = 0;

    this.getMoney = function(){
        return this.money;
    };

    this.getMoneyPs = function(){
        return Math.round(this.moneyPs * 100)/100;
    }

    this.updateMoneyPs = function(){
        var mPs = 0;
        data.items.forEach(function(item){
            mPs += item.moneyPs*item.quantity*item.upgradesModifier;
        });

        this.moneyPs = mPs;
    };

    /*
     Add a @quant of money
     */
    this.addMoney = function(quant){
        this.money += quant;
        this.totalMoney += quant;
    };
}

function Data() {
    this.items = [];
    this.upgrades = [];
    this.itemsUpgrades = [];

}

function Core($scope, game){
    $scope.game = game;
    $scope.click = function(){
        game.addMoney(game.moneyPc);
    }
}

function Item($scope, $interval, game, data){
    var passiveMoney, updateMoneyPs, item;

    $scope.init = function(index){
        data.items[index] = {
            id: index,
            name: items[index].name,
            price: items[index].initialPrice,
            quantity: 0,
            description: items[index].description,
            portrait: items[index].portrait,
            moneyPs: items[index].moneyPs,
            moneyMade: 0,
            upgradesModifier: 1
        };

        $scope.data = data.items[index];
    };

    $scope.detailsVisible = false;

    $scope.showDetails = function(display){
        $scope.detailsVisible = display;
    }

    $scope.canbuy = function(){
        if(game.money >= $scope.data.price){
            return true;
        }else{
            return false;
        }
    }
    $scope.buy = function(){
        if($scope.canbuy()){
            game.money -= $scope.data.price;
            $scope.data.quantity++;
            $scope.data.price = Math.floor(1.5*$scope.data.price);
            game.updateMoneyPs();
            passiveMoney();
        }
    };

    $scope.getMoneyPs = function(){
        return $scope.data.moneyPs;
    };

    /*
     Controls the passive money gains
     */
    passiveMoney = function(){
        var now, increment, before, elapsedTime, a, interval;
        interval = 1000/$scope.getMoneyPs();
        before = new Date().getTime();

        //Prevent 2 $interval instances running at the same time for the item
        if(increment){
            angular.cancel(increment);
        }

        increment = $interval(function() {
            now = new Date().getTime();
            elapsedTime = (now - before);
            if(elapsedTime > interval){
                a = Math.floor(elapsedTime/interval);
            }else{
                a = 1;
            }
            game.addMoney(a);
            $scope.data.moneyMade += a;
            before = new Date().getTime();
        }, interval);
    };

}

function Upgrade($scope, game, data){
    $scope.init = function(index){
        data.upgrades[index] = {
            name: upgrades[index].name,
            for: upgrades[index].for,
            price: upgrades[index].price,
            description: upgrades[index].description,
            effects: upgrades[index].effects,
            buffs: upgrades[index].buffs,
            portrait: upgrades[index].portrait,
            bought: false
        };
        $scope.detailsVisible = false;
        $scope.data = data.upgrades[index];
    };

    $scope.buy = function(){
        if(!$scope.bought){
            if(game.money > $scope.data.price){
                $scope.data.bought = true;
                data.items[$scope.data.for].upgradesModifier *= $scope.data.buffs.moneyPs;
                game.updateMoneyPs();
            }
        }
    }

    $scope.showDetails = function(display){
        $scope.detailsVisible = display;
    }

}

function Perks($scope){
    $scope.items = items;
    $scope.upgrades = upgrades;
    $scope.itemsVisible = true;
    $scope.upgradesVisible = false;

    $scope.showItems = function(){
        $scope.itemsVisible = true;
        $scope.upgradesVisible = false;
    };

    $scope.showUpgrades = function(){
        $scope.itemsVisible = false;
        $scope.upgradesVisible = true;
    };
}