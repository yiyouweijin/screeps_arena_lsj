import { Youxias } from './youxia.mjs';

import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { CostMatrix } from 'game/path-finder';
import { ScoreCollector } from 'arena/season_alpha/collect_and_control/advanced/prototypes';
import { RESOURCE_SCORE_X, RESOURCE_SCORE_Y, RESOURCE_SCORE_Z } from 'arena/season_alpha/collect_and_control/advanced/constants';
// import { } from 'arena';


export function loop() {
    // Your code goes here
    console.log(getTicks())
    var sources = getObjectsByPrototype(Source).filter(s => s.energy > 0);
    // 判断我的所有单位
    var myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_harvests = myCreeps.filter(creep => creep.zhiye == 'harvester');
    var my_caijizhes = myCreeps.filter(creep => creep.zhiye == 'caijizhe');
    var my_erchuanshou = myCreeps.find(creep => creep.zhiye == 'erchuanshou');
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

    var scoreCollector = getObjectsByPrototype(ScoreCollector);
    var score_containers = getObjectsByPrototype(StructureContainer);

    var my_all_youxia = new Youxias(my_zhanshi, mySpawns[0])

    // 生产
    if (my_caijizhes.length < 1) {
        var hc = mySpawns[0].spawnCreep([CARRY, WORK, WORK, WORK, MOVE]).object
        if (hc) {
            hc.zhiye = 'caijizhe'
        }
    } else if (!my_erchuanshou) {
        var hc = mySpawns[0].spawnCreep([CARRY, MOVE]).object
        if (hc) {
            hc.zhiye = 'erchuanshou'
        }
    } else if (my_caijizhes.length < 2) {
        var hc = mySpawns[0].spawnCreep([CARRY, WORK, WORK, WORK, MOVE]).object
        if (hc) {
            hc.zhiye = 'caijizhe'
        }
    } else if (my_all_youxia.create(3)) {
        if (my_carriers.length < 3) {
            var hc = mySpawns[0].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,HEAL]).object
            if (hc) {
                hc.zhiye = 'carrier'
                hc.taidu = 0
            }
        }
    } else if (my_all_youxia.create(10)) {
        if (my_carriers.length < 15) {
            var hc = mySpawns[0].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,HEAL]).object;
            if (hc) {
                hc.zhiye = 'carrier'
                hc.taidu = 0
            }
        }
    }


    for (var my_caijizhe of my_caijizhes) {

        let source = findClosestByPath(my_caijizhe, sources)
        if (my_caijizhe.harvest(source) == ERR_NOT_IN_RANGE) {   // 以后有心情再改成拉车到点位，现在就先move过去
            my_caijizhe.moveTo(source)
        }
        my_caijizhe.transfer(my_erchuanshou, RESOURCE_ENERGY)
    }
    {  // 移动 二传手
        let X = mySpawns[0].x - 1
        let Y = mySpawns[0].y
        if (my_erchuanshou) {
            my_erchuanshou.moveTo({ x: X, y: Y })
            my_erchuanshou.transfer(mySpawns[0], RESOURCE_ENERGY)
        }
    }


    var scoreCollectors = getObjectsByPrototype(ScoreCollector);
    var scoreCollector_x = scoreCollectors.find(s => s.resourceType == RESOURCE_SCORE_X)

    for (let my_carrier of my_carriers) {
        my_carrier.heal(my_carrier)
        if (my_carrier.store[RESOURCE_SCORE_X] > 0) {
            if (my_carrier.transfer(scoreCollector_x, RESOURCE_SCORE_X) == ERR_NOT_IN_RANGE) {
                my_carrier.moveTo(scoreCollector_x);
            }
        }
        else {
            if (score_containers.length > 0) {
                var container = my_carrier.findClosestByPath(score_containers);
                if (my_carrier.withdraw(container, RESOURCE_SCORE_X) == ERR_NOT_IN_RANGE) {
                    my_carrier.moveTo(container);
                }
            }
        }
    }

    my_all_youxia.doing(enemyCreeps, enemystruct, enemytower, enemy_walls, my_hurt_creeps)


}
