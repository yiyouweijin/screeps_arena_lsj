import { Youxias } from './creeps/youxia.mjs';
import { Harvest } from './creeps/harvesters.mjs';

import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { CostMatrix  } from 'game/path-finder';
// import { } from 'arena';




export function loop() {
    // Your code goes here
    console.log(getTicks())
    let costs = new CostMatrix;
    console.log(costs)

    
    // console.log(sources)

    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_zhanshi = myCreeps.filter(creep => creep.zhiye == 'zhanshi');
    var my_hurt_creeps = myCreeps.filter(creep => (creep.hits < creep.hitsMax - 20))

    var mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    var my_all_youxia = new Youxias(my_zhanshi,mySpawn)

    // 生产
    var my_harvest = new Harvest(myCreeps, mySpawn)
    my_harvest.work(3)

    my_all_youxia.create(20)  // 生产战士


    // console.log('line 31')

    // console.log('line 46')
    // 攻击
    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemystruct = getObjectsByPrototype(StructureSpawn).filter(struct => !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct => !struct.my);
    // @ts-ignore
    // var targets = enemyCreeps.concat(enemystruct).concat(enemytower)
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);
    my_all_youxia.doing(enemyCreeps, enemystruct, enemytower,enemy_walls,my_hurt_creeps)


}
