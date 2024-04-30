import { findClosestByPath, getObjectsByPrototype, getTicks, getRange, findInRange, createConstructionSite } from 'game/utils';
import {
    Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart,
    ConstructionSite
} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';



export class Workers {
    /**
     * @param {Creep[]} my_workers
     * @param {StructureSpawn} mySpawn
     * @param {number} hopefule_number
     * @param {ConstructionSite[]} my_gongdis
     * @param {StructureContainer[]} sources
     */
    constructor(my_workers, mySpawn, my_gongdis, sources, hopefule_number) {
        this.my_workers = my_workers;
        this.mySpawn = mySpawn;
        this.hopefule_number = hopefule_number;
        this.my_gongdis = my_gongdis;
        this.sources = sources;
    }


    work() {
        var mySpawn = this.mySpawn;
        var my_workers = this.my_workers;
        var my_gongdi = this.my_gongdis[0];
        var sources = this.sources;
        if (my_gongdi) {
            // 生产工人
            if (!mySpawn.spawning) {
                if (my_workers.length < this.hopefule_number) {
                    let mw = mySpawn.spawnCreep([MOVE, CARRY, MOVE, WORK]).object
                    if (mw) {
                        mw.zhiye = 'worker'
                    }
                }
            }


            for (var my_worker of my_workers) {
                if (my_worker.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    if (my_worker.build(my_gongdi)) {
                        my_worker.moveTo(my_gongdi)
                    }
                } else {
                    if (my_worker.store.getFreeCapacity(RESOURCE_ENERGY)) {
                        // find near container
                        let source = findClosestByPath(my_worker, sources)
                        if (my_worker.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            my_worker.moveTo(source);
                        }
                    }
                }
            }
        } else {
            // 挖矿去
            for (var my_worker of my_workers) {

                if (my_worker.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    // find near container
                    let source = findClosestByPath(my_worker, sources)
                    if (my_worker.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        my_worker.moveTo(source);
                    }
                } else {
                    if (my_worker.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        my_worker.moveTo(mySpawn);
                    }
                }

            }
        }
    }
}