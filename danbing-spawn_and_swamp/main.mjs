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
    var my_youxia = my_zhanshi.filter(creep => creep.bingzhong == 'youxia');
    var my_hurt_creeps = myCreeps.filter(creep => (creep.hits<creep.hitsMax-30))
    // 所有战士都应该有自己的队伍，找到所有的队伍
    // console.log(my_harvests)
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    // 生产
    if (my_harvests.length < 4) {
        var hc = mySpawn.spawnCreep([CARRY, MOVE]).object
        if (hc) {
            hc.zhiye = 'harvester'
        }
    } else if (my_youxia.length<30) {  // 生产战士
        var yx = mySpawn.spawnCreep([MOVE, MOVE, MOVE, MOVE,RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, HEAL]).object
        if (yx) {
            yx.zhiye = 'zhanshi'
            yx.bingzhong = 'youxia'
            yx.taidu = 1
        }
    }else{
        // var nitouche = mySpawn.spawnCreep()
    }
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
    var targets = enemyCreeps.concat(enemystruct).concat(enemytower)
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);
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
    for (var youxia of my_youxia) {
        let closest_target = findClosestByPath(youxia, targets)
        if(!closest_target){
            // @ts-ignore
            closest_target = findClosestByPath(youxia, enemy_walls)
        }
        let range = getRange(youxia, closest_target)

        if(youxia.hits <= youxia.hitsMax-30){
            youxia.heal(youxia)
        }else{
            
            let closest_my_hurt_creeps = findInRange(youxia, my_hurt_creeps, 1)
            if(closest_my_hurt_creeps){
                youxia.heal(closest_my_hurt_creeps[0])
            }else{
                let closest_my_hurt_creeps3 = findInRange(youxia, my_hurt_creeps, 3)
                if(closest_my_hurt_creeps3){
                    youxia.heal(closest_my_hurt_creeps3[0])
                }else{
                    youxia.heal(youxia)
                }
            }
        }
        if (range <= 3) {
            youxia.rangedAttack(closest_target)
        } 
        if(youxia.taidu>0 && range>3){
            youxia.moveTo(closest_target)
        }
        if (youxia.hits < 700) {
            youxia.taidu = 0
        }
        if(youxia.hits>900){
            youxia.taidu = 1
        }
        if (youxia.taidu<1 || range<3 ){
            youxia.moveTo(mySpawn)
        }
    }
}
