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
    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    var enemySpawns = getObjectsByPrototype(StructureSpawn).filter(struct => !struct.my);
    var enemytower = getObjectsByPrototype(StructureTower).filter(struct => !struct.my);
    var enemy_walls = getObjectsByPrototype(StructureRampart).filter(a => !a.my);
    var sources = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) > 5);
    // 判断工地
    var my_gongdis = getObjectsByPrototype(ConstructionSite).filter(site => site.my);
    // 判断工人
    var my_workers = myCreeps.filter(creep => creep.zhiye == 'worker');

    // 各模块初始化
    var my_harvest = new Harvest(myCreeps, mySpawn)
    var my_all_youxia = new Youxias(my_zhanshi, mySpawn)
    var workers = new Workers(my_workers, mySpawn, my_gongdis, sources, 2)

    var my_adcs = my_zhanshi.filter(creep => creep.bingzhong == 'adc');

    // my_all_youxia.create(20)  // 多余的钱造游侠

    // 生产
    if (my_adcs.length<4) {
        var ad = mySpawn.spawnCreep([RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,RANGED_ATTACK,MOVE,]).object
        if (ad) {
            ad.bingzhong = 'adc'
            ad.zhiye = 'zhanshi'
        }
    }
    // 行动
    if(getTicks()<1600){
        // 移动
        let myspawn_x = mySpawn.x
        let myspawn_y = mySpawn.y
        let k=0
        for(let i=-1;i<2;i=i+2){
            for(let j=-1;j<2;j=j+2){
                let x = myspawn_x + i
                let y = myspawn_y + j
                if(k<my_adcs.length){
                    my_adcs[k].moveTo({x,y})
                }
                k=k+1
            }
        }
        // 攻击
        let gognji = [10,4,1]
        for(let my_adc of my_adcs){ 
            let targets = findInRange(my_adc,enemyCreeps,3)
            if(targets.length>0){
                let mass_hits = 0
                for(let target of targets){
                    mass_hits = mass_hits +gognji[getRange(my_adc,target)]
                }
                if(mass_hits>10){
                    my_adc.rangedMassAttack()
                }else{
                    my_adc.rangedAttack(targets[0])
                }
            }
        }
    }else{ // 如果ticks大于1500
        for(let my_adc of my_adcs){
            // 往过边跑边打
            my_adc.moveTo(enemySpawns[0])
            my_adc.rangedAttack(findInRange(my_adc,enemytower, 3)[0])
            my_adc.rangedAttack(findInRange(my_adc,enemySpawns, 3)[0])
            my_adc.rangedAttack(findInRange(my_adc,enemyCreeps, 3)[0])
        }
    }


    // 各模块行动  重要性从下往上
    my_all_youxia.create(2)  // 先造两个游侠
    my_all_youxia.doing(enemyCreeps, enemySpawns, enemytower, enemy_walls, my_hurt_creeps)
    workers.work()
    my_harvest.work(2, sources)



    // 构建工地
    if (getTicks() < 2) {
        let myspawn_x = mySpawn.x
        let myspawn_y = mySpawn.y
        
        createConstructionSite({x: myspawn_x , y: myspawn_y}, StructureRampart)
        for (let i = -1; i < 2; i=i+2) {
            for (let j = -1; j < 2; j=j+2) {
                let x = myspawn_x + i
                let y = myspawn_y + j
                createConstructionSite({ x, y }, StructureRampart)
            }
        }
    }
    console.log('no error')
}
