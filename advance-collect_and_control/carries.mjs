import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { ScoreCollector } from 'arena/season_alpha/collect_and_control/advanced/prototypes';
import { RESOURCE_SCORE_X, RESOURCE_SCORE_Y, RESOURCE_SCORE_Z } from 'arena/season_alpha/collect_and_control/advanced/constants';


export class Carries {
    /**
     * @param {Creep[]} my_carriers
     ** @param {StructureSpawn} mySpawn
     */
     constructor(my_carriers,mySpawn) {
        this.my_carriers = my_carriers;
        this.number = this.my_carriers.length;
        this.mySpawn = mySpawn;
    }

        /**
     * @param {number} mubiao_number
     */
    create(mubiao_number) {
        var t1 = this.my_carriers.filter(creep => creep.resType == 1).length
        var t2 = this.my_carriers.filter(creep => creep.resType == 2).length
        var t3 = this.my_carriers.filter(creep => creep.resType == 3).length
        var type = 3
        if(t1 == Math.min(t1,t2,t3)){type = 1}
        else if(t2 == Math.min(t1,t2,t3)){type = 2}
        if (this.number < mubiao_number) {
            var hc = this.mySpawn.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,MOVE, CARRY,HEAL]).object
            if (hc) {
                hc.zhiye = 'carrier'
                hc.taidu = 0
                hc.resType = type
            }
            return false
        }
        return true
    }

    /**
     * @param {ScoreCollector[]} scoreCollectors
     * @param {StructureContainer[]} score_containers
     */
    doing(scoreCollectors,score_containers){

        var scoreCollector_x = scoreCollectors.find(s => s.resourceType == RESOURCE_SCORE_X)
        var scoreCollector_y = scoreCollectors.find(s => s.resourceType == RESOURCE_SCORE_Y)
        var scoreCollector_z = scoreCollectors.find(s => s.resourceType == RESOURCE_SCORE_Z)
        var score_containers_x = score_containers.filter(s => s.store[RESOURCE_SCORE_X] > 0 )
        var score_containers_y = score_containers.filter(s => s.store[RESOURCE_SCORE_Y] > 0 )
        var score_containers_z = score_containers.filter(s => s.store[RESOURCE_SCORE_Z] > 0 )

        var my_carriers = this.my_carriers
        for (let my_carrier of my_carriers) {
            if(my_carrier.resType == 1){
                var scoreCollector = scoreCollector_x
                var RESOURCE_SCORE_ = RESOURCE_SCORE_X
                var scrs = score_containers_x
            }else if(my_carrier.resType == 2){
                var scoreCollector = scoreCollector_y
                var RESOURCE_SCORE_ = RESOURCE_SCORE_Y
                var scrs = score_containers_y
            }else if(my_carrier.resType == 3){
                var scoreCollector = scoreCollector_z
                var RESOURCE_SCORE_ = RESOURCE_SCORE_Z
                var scrs = score_containers_z
            }else{
                console.log('no resourceType')
                return
            }
            my_carrier.heal(my_carrier)
            if (my_carrier.store[RESOURCE_SCORE_] > 0) {
                if (my_carrier.transfer(scoreCollector, RESOURCE_SCORE_) == ERR_NOT_IN_RANGE) {
                    my_carrier.moveTo(scoreCollector);
                }
            }
            else {
                if (score_containers.length > 0) {
                    var container = my_carrier.findClosestByPath(scrs);
                    if (my_carrier.withdraw(container, RESOURCE_SCORE_) == ERR_NOT_IN_RANGE) {
                        my_carrier.moveTo(container);
                    }
                }
            }
        }
    }
}