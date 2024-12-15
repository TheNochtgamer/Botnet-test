import {
  BehaviorFollowEntity,
  BehaviorGetClosestEntity,
  BehaviorLookAtEntity,
  StateTransition,
  EntityFilters,
  NestedStateMachine,
  BotStateMachine,
  BehaviorIdle,
  StateMachineTargets
} from 'mineflayer-statemachine';
import { type Bot } from 'mineflayer';
import { setTimeout as delay } from 'node:timers/promises';
import exeTicks from '../utils/exeTicks';
import { MyBot } from '../MyBot';

class TransitionService {
  public bot: Bot;
  public myBot: MyBot;
  public transitions: StateTransition[] = [];
  private deathReset = false;
  private targets: StateMachineTargets = {};

  constructor(myBot: MyBot, bot: Bot) {
    this.myBot = myBot;
    this.bot = bot;
  }

  public async init() {
    // await delay(1000);

    const getClosestPlayer = new BehaviorGetClosestEntity(
      this.bot,
      this.targets,
      entity =>
        entity.type === 'player' &&
        entity.username !== this.bot.username &&
        !this.myBot.botNetUsernames.has(entity.username + '')
    );
    const followPlayer = new BehaviorFollowEntity(this.bot, this.targets);
    const idleState = new BehaviorIdle();
    const lookAtPlayer = new BehaviorLookAtEntity(this.bot, this.targets);

    let lastCheck = Date.now();

    this.transitions = [
      new StateTransition({
        parent: idleState,
        child: getClosestPlayer,
        shouldTransition: () => exeTicks.tick('waitAfterIdle', 60)
      }),
      new StateTransition({
        parent: getClosestPlayer,
        child: lookAtPlayer,
        shouldTransition: () => true,
        onTransition: () => {
          // this.bot.chat(`Ya te tengo ${lookAtPlayer.targets.entity?.username}`);
        }
      }),
      new StateTransition({
        parent: lookAtPlayer,
        child: getClosestPlayer,
        shouldTransition: () => lastCheck + 4000 < Date.now(),
        onTransition: () => {
          lastCheck = Date.now();
        }
      }),

      // new StateTransition({
      //   parent: followPlayer,
      //   child: idleState,
      //   name: 'death reset',
      //   shouldTransition: () => this.iDiedRecently(),
      //   onTransition: () => this.bot.chat(`Reinicio`)
      // }),
      // new StateTransition({
      //   parent: lookAtPlayer,
      //   child: idleState,
      //   name: 'death reset',
      //   shouldTransition: () => this.iDiedRecently(),
      //   onTransition: () => this.bot.chat(`Reinicio`)
      // }),
      new StateTransition({
        parent: lookAtPlayer,
        child: followPlayer,
        shouldTransition: () => lookAtPlayer.distanceToTarget() > 4
      }),
      new StateTransition({
        parent: followPlayer,
        child: lookAtPlayer,
        shouldTransition: () => followPlayer.distanceToTarget() < 3
      }),
      new StateTransition({
        parent: lookAtPlayer,
        child: followPlayer,
        shouldTransition: () => lookAtPlayer.distanceToTarget() >= 4
      })
    ];

    const rootLayer = new NestedStateMachine(this.transitions, idleState);
    rootLayer.stateName = 'main';

    new BotStateMachine(this.bot, rootLayer);
  }

  private iDiedRecently(): boolean {
    if (this.deathReset) {
      this.deathReset = false;
      return true;
    }
    return false;
  }

  public onDeath() {
    this.deathReset = true;
  }
}

export default TransitionService;
