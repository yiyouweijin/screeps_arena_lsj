import { Youxias } from './zhanshi/youxia.mjs';

import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
// import { } from 'arena';



export function loop() {
    // Your code goes here
    console.log(getTicks())

    var sources = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
    // console.log(sources)

    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_harvests = myCreeps.filter(creep => creep.zhiye == 'harvester');
    var my_zhanshi = myCreeps.filter(creep => creep.zhiye == 'zhanshi');
    var my_hurt_creeps = myCreeps.filter(creep => (creep.hits < creep.hitsMax - 20))

    var mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    var my_all_youxia = new Youxias(my_zhanshi,mySpawn)
    // 生产
    if (my_harvests.length < 4) {
        var hc = mySpawn.spawnCreep([CARRY, MOVE]).object
        if (hc) {
            hc.zhiye = 'harvester'
        }
    }
    my_all_youxia.create( 30)  // 生产战士


    // console.log('line 31')
    // 采集能量
    for (var my_harvest of my_harvests) {
        if (my_harvest.store.getFreeCapacity(RESOURCE_ENERGY)) {
            // find near container
            let source = findClosestByPath(my_harvest, sources)
            if (my_harvest.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(source);
            }
        } else {
            if (my_harvest.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(mySpawn);
            }
        }
    }
    // console.log('line 46')
    // 攻击
    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemystruct = getObjectsByPrototype(StructureSpawn).filter(struct => !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct => !struct.my);
    // @ts-ignore
    // var targets = enemyCreeps.concat(enemystruct).concat(enemytower)
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);
    my_all_youxia.doing(enemyCreeps, enemystruct, enemytower,enemy_walls,my_hurt_creeps)
    // for(var zhanshi of my_zhanshi){
    //     let target = findClosestByPath(zhanshi,targets)
    //     if(target){
    //         if(zhanshi.attack(target) == ERR_NOT_IN_RANGE) {
    //             zhanshi.moveTo(target);
    //         }
    //     }else{
    //         let target_wall = findClosestByPath(zhanshi,enemy_walls)
    //         if(zhanshi.attack(target_wall) == ERR_NOT_IN_RANGE) {
    //             zhanshi.moveTo(target_wall);
    //         }

    //     }
    // }

}
