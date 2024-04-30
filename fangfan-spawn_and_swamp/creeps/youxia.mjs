import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange, getTerrainAt } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE, TERRAIN_WALL, TERRAIN_SWAMP } from 'game/constants';
import { searchPath,CostMatrix } from 'game/path-finder';

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
            var yx = this.mySpawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, HEAL]).object
            if (yx) {
                yx.zhiye = 'zhanshi'
                yx.bingzhong = 'youxia'
                yx.taidu = 1
                return true
            }
            return false
        }
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
        var targets = enemyCreeps.concat(enemystructs).concat(enemytowers)
        var enemy_zhanshis = enemyCreeps.filter(creep => 
            (creep.body.some(bodyPart => bodyPart.type == RANGED_ATTACK))||(creep.body.some(bodyPart => bodyPart.type == ATTACK)))
        let costs = new CostMatrix;
        for(let i=0;i<100;i++){
            for(let j=0;j<100;j++){
                let tile = getTerrainAt({x:i,y:j});
                let weight =
                tile === TERRAIN_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_SWAMP ?   5 : // swamp => weight:  5
                                           1 ; // plain => weight:  1
                costs.set(i, j, weight);
            }
        }
        for(let enemy_zhanshi of enemy_zhanshis){
            
        }

        for (var youxia of this.my_youxia) {
            let closest_target = findClosestByPath(youxia, targets)
            if (!closest_target) {
                // @ts-ignore
                closest_target = findClosestByPath(youxia, enemy_walls)
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
            }
            if (youxia.hits < 700) {
                youxia.taidu = 0
            }
            if (youxia.hits > 800) {
                youxia.taidu = 1
            }
            if (youxia.taidu < 1 || range < 3) {
                // 逃跑
                if(getRange(youxia,this.mySpawn)>8){
                    // 如果在出生点外，就往家里跑
                    youxia.moveTo(this.mySpawn)
                }else{
                    // 如果在出生点内，就往远离敌人的方向跑
                    searchPath
                }
            }
        }
    }
}