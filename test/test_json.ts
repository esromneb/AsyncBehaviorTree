const assert = require("assert");
const merge = require('deepmerge');



import {
AsyncBehaviorTree,
IJsonFunctionWriterCb,
ABTJsonLogger,
} from "../src/AsyncBehaviorTree";


import {
Blackboard1Parent
} from "./helpers/Blackboard1Parent";


const testTree5 = require("./btrees/testTree5.xml");


class MockAsyncBehaviorTreeJsonLogger implements ABTJsonLogger{

  nodeOffset: number = 100;

  savedXml: string;

  constructor(public options: any = {print:false}) {
    this.currentNodeId = this.nodeOffset;
  }


  parseXML(xml: string): void {
    if(this.options.print) {
      console.log("Saved xml length " + xml.length);
    }
    this.savedXml = xml;
  }

  transitionCount: number = 0;

  logTransition(uid: number, prev_status: number, status: number): void {
    if(this.options.print) {
      console.log(`transition ${uid} ${prev_status} -> ${status}`);
    }
    this.transitionCount++;
  }

  getNameForUID(u: number): string {
    if( this.options.print ) {
      console.log(`getNameForUID ${u}`);
    }
    return this.preNames[''+u];
  }
  getForPath(path: string): number {
    if( this.options.print ) {
      console.log(`getForPath ${path}`);
    }
    return this.preWalkPaths[path];
  }

  cb: IJsonFunctionWriterCb;

  writeJsonToCallback(cb: IJsonFunctionWriterCb) {
    this.cb = cb;
  }

  preNames = {};

  preWalkPaths = {};

  currentNodeId: number;

  preWalkTree(cb: any): void {
    this.preWalkPaths[cb.path] = this.currentNodeId;

    this.preNames[''+this.currentNodeId] = cb.name || cb.w;

    if( this.options.print ) {
      console.log(`set ${this.currentNodeId} = ${cb.path} = ${this.preNames[''+this.currentNodeId]}`);
    }

    this.currentNodeId++;
  }


}





test("Test JSON logger", async function(done) {


  let print: boolean = false;

  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testTree5, helper.blackBoard);

  let jut = new MockAsyncBehaviorTreeJsonLogger({print});

  dut.setJsonLogger(jut);

  dut.printCall = false;
  dut.printParse = false;

  helper.reset();

  // go through the tree the 1st time
  await dut.execute();

  // I would expect an exact transitionCount
  // however I will be eventually changing the logging here


  let a = jut.transitionCount;

  expect(jut.transitionCount).not.toBe(0);
  expect(jut.savedXml.length > 1000 ).toBe(true);

  // go through the tree a 2nd time
  await dut.execute();

  expect(jut.transitionCount > a).toBe(true);

  if(print) {
    console.log(helper.blackBoard.called);
  }


  done();
});
