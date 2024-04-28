import {findClosestByPath, getObjectsByPrototype,getTicks  } from 'game/utils';
import { Creep,StructureSpawn,Source,StructureContainer,Structure,
    OwnedStructure,StructureTower,StructureRampart  } from 'game/prototypes';
import {MOVE,ATTACK,HEAL,RANGED_ATTACK,WORK,CARRY,RESOURCE_ENERGY,ERR_NOT_IN_RANGE } from 'game/constants';
// import { } from 'arena';


export function loop() {
    // Your code goes here
    console.log(getTicks())

    var sources = getObjectsByPrototype(StructureContainer).filter(s=>s.store.getUsedCapacity(RESOURCE_ENERGY)>50);
    // console.log(sources)

    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_harvests = myCreeps.filter(creep => creep.zhiye == 'harvester');
    var my_zhanshi = myCreeps.filter(creep => creep.zhiye == 'zhanshi');
    // 所有战士都应该有自己的队伍，找到所有的队伍
    var teams = [];
    var remain_zhanshi = my_zhanshi.length;
    for (let i=1;i<99;i++){
        teams[i] = myCreeps.filter(creep=>creep.team == i)
        remain_zhanshi = remain_zhanshi - teams[i].length
        if(remain_zhanshi<=0){
            break;
        }
    }

    // console.log(my_harvests)
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(s=>s.my);
    // 生产
    if(my_harvests.length<3){
        var hc=mySpawn.spawnCreep([CARRY,MOVE]).object
        if(hc){
            hc.zhiye = 'harvester'
        }
    }else{  // 生产战士，以team为单位，每个队伍4个战士
        for(let i=1;i<=teams.length;i++){
            
        }
    }
    // console.log('line 31')
    // 采集能量
    for(var my_harvest of my_harvests){
        if(my_harvest.store.getFreeCapacity(RESOURCE_ENERGY)) {
            // find near container
            let source = findClosestByPath(my_harvest,sources)
            if(my_harvest.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(source);
            }
        } else {
            if(my_harvest.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(mySpawn);
            }
        }
    }
    // console.log('line 46')
    // 攻击
    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemystruct = getObjectsByPrototype(StructureSpawn).filter(struct=> !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct=> !struct.my);
    // @ts-ignore
    var targets = enemyCreeps.concat(enemystruct).concat(enemytower)
    var enemy_walls = getObjectsByPrototype(StructureRampart ).filter(a=>!a.my);
    for(var zhanshi of my_zhanshi){
        let target = findClosestByPath(zhanshi,targets)
        if(target){
            if(zhanshi.attack(target) == ERR_NOT_IN_RANGE) {
                zhanshi.moveTo(target);
            }
        }else{
            let target_wall = findClosestByPath(zhanshi,enemy_walls)
            if(zhanshi.attack(target_wall) == ERR_NOT_IN_RANGE) {
                zhanshi.moveTo(target_wall);
            }

        }
    }
}
