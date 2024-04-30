import { Youxias } from './creeps/youxia.mjs';
import { Harvest } from './creeps/harvesters.mjs';
import { Workers } from './creeps/worker.mjs';

import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange, createConstructionSite } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart,
    ConstructionSite
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { CostMatrix } from 'game/path-finder';
// import { } from 'arena';




export function loop() {
    // Your code goes here
    console.log(getTicks())
    // let costs = new CostMatrix;
    // console.log(costs)


    // console.log(sources)

    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_zhanshi = myCreeps.filter(creep => creep.zhiye == 'zhanshi');
    var my_hurt_creeps = myCreeps.filter(creep => (creep.hits < creep.hitsMax - 20))
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    var my_all_youxia = new Youxias(my_zhanshi, mySpawn)

    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemystruct = getObjectsByPrototype(StructureSpawn).filter(struct => !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct => !struct.my);
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);

    var sources = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) > 5);
    // 生产
    var my_harvest = new Harvest(myCreeps, mySpawn)
    if (!mySpawn.spawning) {
        my_all_youxia.create(2)  // 生产战士
    }


    // 判断工地
    var my_gongdis = getObjectsByPrototype(ConstructionSite).filter(site => site.my);
    // 判断工人
    var my_workers = myCreeps.filter(creep => creep.zhiye == 'worker');

    var workers = new Workers(my_workers, mySpawn, my_gongdis, sources, 2)
    workers.work()
    

    // createConstructionSite()
    // 攻击
    my_all_youxia.doing(enemyCreeps, enemystruct, enemytower, enemy_walls, my_hurt_creeps)
    my_harvest.work(2, sources)


    // 构建工地
    if (getTicks() < 2) {
        var myspawn_x = mySpawn.x
        var myspawn_y = mySpawn.y
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let x = myspawn_x + i
                let y = myspawn_y + j
                createConstructionSite({ x, y }, StructureRampart)
            }
        }
    }
    console.log('no error')
}
