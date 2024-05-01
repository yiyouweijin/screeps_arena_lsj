import { Youxias } from './youxia.mjs';

import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { CostMatrix  } from 'game/path-finder';
import { RESOURCE_SCORE, ScoreCollector } from 'arena/season_alpha/collect_and_control/basic';
// import { } from 'arena';

export function loop() {
    // Your code goes here
    console.log(getTicks())
    var sources = getObjectsByPrototype(Source).filter(s => s.energy > 0);
    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_harvests = myCreeps.filter(creep => creep.zhiye == 'harvester');
    var my_zhanshi = myCreeps.filter(creep => creep.zhiye == 'zhanshi');
    var my_hurt_creeps = myCreeps.filter(creep => (creep.hits < creep.hitsMax - 20))
    var my_carriers = myCreeps.filter(creep => creep.zhiye == 'carrier');
    var mySpawns = getObjectsByPrototype(StructureSpawn).filter(s => s.my);

    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemystruct = getObjectsByPrototype(StructureSpawn).filter(struct => !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct => !struct.my);
    // @ts-ignore
    // var targets = enemyCreeps.concat(enemystruct).concat(enemytower)
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);

    var scoreCollector = getObjectsByPrototype(ScoreCollector)[0];
    var score_containers = getObjectsByPrototype(StructureContainer);

    var my_all_youxia = new Youxias(my_zhanshi,mySpawns[0])
    
     // 生产
     if (my_harvests.length < 1) {
        var hc = mySpawns[0].spawnCreep([CARRY, MOVE,WORK,MOVE,WORK,WORK,MOVE]).object
        if (hc) {
            hc.zhiye = 'harvester'
        }
    }else if(my_harvests.length < 3){
        var hc = mySpawns[0].spawnCreep([CARRY, MOVE,WORK,MOVE,WORK,WORK,MOVE,MOVE]).object
        if (hc) {
            hc.zhiye = 'harvester'
        }
    }else if(my_all_youxia.create(3)){
        if(my_carriers.length < 3){
            var hc = mySpawns[0].spawnCreep([ MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE]).object
            if (hc) {
                hc.zhiye = 'carrier'
            }
        }
    }
    my_all_youxia.create(30)
    for (var my_harvest of my_harvests) {
        if (my_harvest.store.getFreeCapacity(RESOURCE_ENERGY)) {
            // find near container
            let source = findClosestByPath(my_harvest, sources)
            if (my_harvest.harvest(source) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(source);
            }
        } else {
            if (my_harvest.transfer(mySpawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                my_harvest.moveTo(mySpawns[0]);
            }
        }
    }


    for(let my_carrier of my_carriers){
        
        if(my_carrier.store[RESOURCE_SCORE] > 0) {
            if(my_carrier.transfer(scoreCollector, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
                my_carrier.moveTo(scoreCollector);
            }
        }
        else{
            if(score_containers.length > 0) {
                var container = my_carrier.findClosestByPath(score_containers);
                if(my_carrier.withdraw(container, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
                    my_carrier.moveTo(container);
                }
            }
        }
    }

    my_all_youxia.doing(enemyCreeps, enemystruct, enemytower,enemy_walls,my_hurt_creeps)


}
