import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';


export class Youxias {
    /**
     * @param {Creep[]} my_zhanshi
     ** @param {StructureSpawn} mySpawn
     */
    constructor(my_zhanshi,mySpawn) {
        this.my_youxia = my_zhanshi.filter(creep => creep.bingzhong == 'youxia');
        this.number = this.my_youxia.length;
        this.mySpawn = mySpawn;
    }

    /**
     * @param {number} mubiao_number
     */
    create(mubiao_number) {
        if (this.number < mubiao_number) {
            var yx = this.mySpawn.spawnCreep([MOVE, MOVE, MOVE,  RANGED_ATTACK, MOVE, MOVE, MOVE,RANGED_ATTACK , RANGED_ATTACK, HEAL]).object
            if (yx) {
                yx.zhiye = 'zhanshi'
                yx.bingzhong = 'youxia'
                yx.taidu = 1
            }
            return false
        }
        return true
    }

    /**
     * @param {Creep[]} enemyCreeps
     * @param {Structure[]} enemystructs
     * @param {StructureTower[]} enemytowers
     * @param {StructureRampart[]} enemy_walls
     * @param {Creep[]} my_hurt_creeps
     */
    doing(enemyCreeps, enemystructs, enemytowers,enemy_walls,my_hurt_creeps) {
        // @ts-ignore
        var targets = enemyCreeps

        if(!enemyCreeps){
            if(!enemystructs){
                console.log('no enemy')
                return 0
            }
        }

        for (var youxia of this.my_youxia) {
            let closest_target = findClosestByPath(youxia, targets)

            if(closest_target == null){
                // @ts-ignore
                closest_target = findClosestByPath(youxia, enemystructs)
            }

            let range = getRange(youxia, closest_target)

            if (youxia.hits <= youxia.hitsMax - 20) {
                youxia.heal(youxia)
            } else {

                let closest_my_hurt_creeps = findInRange(youxia, my_hurt_creeps, 1)
                if (closest_my_hurt_creeps) {
                    youxia.heal(closest_my_hurt_creeps[0])
                } else {
                    let closest_my_hurt_creeps3 = findInRange(youxia, my_hurt_creeps, 3)
                    if (closest_my_hurt_creeps3) {
                        youxia.heal(closest_my_hurt_creeps3[0])
                    } else {
                        youxia.heal(youxia)
                    }
                }
            }
            if (range <= 3) {
                youxia.rangedAttack(closest_target)
            }
            if (youxia.taidu > 0 && range > 3) {
                youxia.moveTo(closest_target)
                var closest_wall = findClosestByPath(youxia, enemy_walls)
                if (closest_wall) {
                    youxia.rangedAttack(closest_wall)
                }
            }
            if (youxia.hits < 700) {
                youxia.taidu = 0
            }
            if (youxia.hits > 800) {
                youxia.taidu = 1
            }
            if (youxia.taidu < 1 || range < 3) {
                youxia.moveTo(this.mySpawn)
            }
        }
    }
}