import { findClosestByPath, getObjectsByPrototype,
     getTicks, getRange, findInRange, 
     findClosestByRange} from 'game/utils';
import {Creep, StructureSpawn, Source, StructureContainer, Structure,
    OwnedStructure, StructureTower, StructureRampart,StructureWall} from 'game/prototypes';
import { MOVE, ATTACK, HEAL, RANGED_ATTACK, 
    WORK, CARRY, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
// @ts-ignore
import { Flag } from 'arena';

export function loop() {
    // Your code goes here
    console.log(getTicks())
    var enemyFlag = getObjectsByPrototype(Flag).find(object => object.my==false);
    var nature_flag = getObjectsByPrototype(Flag).find(object => object.my == undefined);
    let my_flag = getObjectsByPrototype(Flag).find(object => object.my);
    var Creeps = getObjectsByPrototype(Creep);
    var my_creeps = Creeps.filter(creep => creep.my);
    var enemy_creeps = Creeps.filter(creep => !creep.my);
    var walls = getObjectsByPrototype(StructureWall);

    if(nature_flag){
        var aim_flag = nature_flag
    }else{
        var aim_flag = enemyFlag
    }

    for(let my_creep of my_creeps){
        my_creep.moveTo(aim_flag)
        if(my_creep.body.some(bodyPart => bodyPart.type == ATTACK)) {
            var aim = findInRange(my_creep,enemy_creeps, 1)[0]
            if(!aim){
                // @ts-ignore
                var aim = findInRange(my_creep,walls, 1)[0]
            }
            my_creep.attack(aim)
        }
        if(my_creep.body.some(bodyPart => bodyPart.type == RANGED_ATTACK)) {
            var aim = findInRange(my_creep,enemy_creeps, 3)[0]
            if(!aim){
                // @ts-ignore
                var aim = findInRange(my_creep,walls, 3)[0]
            }
            my_creep.rangedAttack(aim)
        }
        if(my_creep.body.some(bodyPart => bodyPart.type == HEAL)) {
            var myDamagedCreeps = my_creeps.filter(i => i.hits < i.hitsMax-12);
            if(myDamagedCreeps.length > 0) {
                if(my_creep.heal(myDamagedCreeps[0]) == ERR_NOT_IN_RANGE) {
                    my_creep.moveTo(myDamagedCreeps[0]);
                }
            }
        }
    }
    const towers = getObjectsByPrototype(StructureTower);
    let best_target = findClosestByRange(my_flag, enemy_creeps);
    for(let tower of towers){
        tower.attack(best_target);
    }
}
