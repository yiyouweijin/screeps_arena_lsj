import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';

export class Harvest {
    /**
     * @param {Creep[]} myCreeps
     ** @param {StructureSpawn} mySpawn
     */
    constructor(myCreeps, mySpawn,) {
        this.mySpawn = mySpawn;
        this.my_harvests = myCreeps.filter(creep => creep.zhiye == 'harvester');
        this.number = this.my_harvests.length;

    }

    /**
     * @param {number} hopefule_number
     * @param {StructureContainer[]} sources
     */
    work(hopefule_number, sources) {
        if (!this.mySpawn.spawning) {
            if (!findInRange(this.mySpawn, sources, 6)) {
                hopefule_number = 0
            }
            if (this.my_harvests.length < hopefule_number) {
                var hc = this.mySpawn.spawnCreep([CARRY, MOVE]).object
                if (hc) {
                    hc.zhiye = 'harvester'
                }
            }
        }
        // 采集能量
        for (var my_harvest of this.my_harvests) {
            if (my_harvest.store.getFreeCapacity(RESOURCE_ENERGY)) {
                // find near container
                let source = findClosestByPath(my_harvest, sources)
                if (my_harvest.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    my_harvest.moveTo(source);
                }
            } else {
                if (my_harvest.transfer(this.mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    my_harvest.moveTo(this.mySpawn);
                }
            }
        }
    }

}