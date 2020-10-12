var xml2js = require('xml2js');
const merge = require('deepmerge');
const is2 = require('is2');

export interface IExecuteTreeArgs {
  [name: string]: string;
}

export interface IExecuteTree {
  w: string;
  seq?: any[];
  name?: string;
  args?: IExecuteTreeArgs;
  uid?: number;
}

type Vec2 = [number,number];

export interface ABTZmqLogger {
  dataCallback(buf: Uint8Array, flushBuf: Vec2[]): void;
  run(): Promise<void>;
}


export interface IFunctionWriterCb {
    (buf: Uint8Array): void;
}

export interface IJsonFunctionWriterCb {
  (str: string): void;
}

export interface IConversionFunction {
    (tout: string, vin: any, is: any): any;
}

export interface ABTLoggerBase {
  logTransition(uid: number, prev_status: number, status: number): void;
  getNameForUID(u: number): string;
  getForPath(path: string): number;
  parseXML(xml: string): void;
}

export interface ABTWasmLogger extends ABTLoggerBase {
  start(): Promise<void>;
  reset(): void;
  setFilePath(path: string): Promise<void>;
  registerActionNodes(ns: string[]): void;
  registerConditionNodes(ns: string[]): void;
  getForPathArray(ps: number[]): number;
  writeToCallback(cb: IFunctionWriterCb): void;
}

export interface ABTJsonLogger extends ABTLoggerBase {
  writeJsonToCallback(cb: IJsonFunctionWriterCb): void;
  preWalkTree(cb: any): void;
}


// true / false does not matter
// just the key
const supportedNodes = {
  'sequence':true,
  'fallback':true,
  'inverter':true,
  'forcesuccess':true,
  'action':true,
  'condition':true,
  'alwaysfailure': true,
  'alwayssuccess': true,
  'forcefailure': true,
  'repeat': true,
  'setblackboard': true,
  'retryuntilsuccesful': true,
};

// true means I plan to support
// false means I do not plan
// right now I don't know of a way to support reactive nodes
// maybe in the future
const plannedSupport = {
  'keeprunninguntilfailure': true,
  'switch2': true,
  'switch3': true,
  'switch4': true,
  'switch5': true,
  'switch6': true,
  'blackboardcheckdouble': true,
  'blackboardcheckint': true,
  'blackboardcheckstring': true,
  'timeout': true,
  'subtree': true,
  'delay': true,
  'subtreeplus': false,
  'reactivefallback': false,
  'reactivesequence': false,
  'ifthenelse': false,
  'manualselector': false,
  'sequencestar': false,
  'parallel': false,
  'whiledoelse': false,
};



class AsyncBehaviorTree {

  p: any;

  exe: IExecuteTree[] = [];

  printParse: boolean = false;
  printCall: boolean = false;
  printWarnings: boolean = true;
  logRecurse: boolean = false;
  logLoadPath: boolean = false;
  warnUndefinedReturn: boolean = true;
  warnWhenCreatingNewObjects: boolean = false;
  warnWhenOutputNotFilled: boolean = false;
  printWrites: boolean = false;

  debugDoStrip: boolean = false;

  destroyed: boolean = false;

  nestingTypes: Set<string> = new Set([
    'sequence',
    'fallback',
    'inverter',
    'forcesuccess',
    'forcefailure',
    'repeat',
    'retryuntilsuccesful',
  ]);

  rawXml: string;

  constructor(xml: string, public bb: any, public warningCb?: {(m: string): void}) {
    const opts = {
      explicitChildren: true,
      preserveChildrenOrder: true,
    };

    if( this.warningCb == undefined ) {
      this.warningCb = this.consoleLogWarning.bind(this);
    }

    let parser = new xml2js.Parser(opts);

    this.rawXml = xml;
    parser.parseString(xml, this.parseResults.bind(this));

    this.regsiterBuiltInTypeConversions();
  }

  destroy(): void {
    this.destroyed = true;
    this.p = null;
    this.exe = null;
  }

  // istanbul ignore next
  warning(t: string): void {
    this.warningCb(t);
  }

  // istanbul ignore next
  consoleLogWarning(t: string): void {
    if(this.printWarnings) {
      const prefix = 'ABT Warning: ';
      console.log(prefix + t);
    }
  }

  evaluateCondition(n: string): boolean {
    // istanbul ignore if
    if( this.printCall ) {
      console.log(`checking condition ${n}`);
    }

    let result = this.bb[n];

    if( result ) {
      return true;
    } else {
      return false;
    }
  }

  private regsiterBuiltInTypeConversions(): void {

    this.registerTypeConversion('s', (tout, vin, is)=>{
      return '' + vin;
    });

    this.registerTypeConversion('f', (tout, vin, is)=>{
      return parseFloat(vin);
    });

  }

  typeConvert: any = {};

  registerTypeConversion(tout: string, cb: IConversionFunction) {
    // istanbul ignore if
    if( tout in this.typeConvert ) {
      throw new Error(`Error: can't register type conversion for ${tout}, it already exists`);
    }

    this.typeConvert[tout] = cb;
  }

  // tout is the type we are requesting out
  // vin is the value in
  doTypeConversion(tout: string, vin: any): any {
    if( !(tout in this.typeConvert) ) {
      this.warning(`Unknown conversion suffix :${tout}`);
      return vin;
    }

    return this.typeConvert[tout](tout, vin, is2);
  }

  // looks for ${}
  scanForVariable(trimmed: string): boolean {
    if(trimmed.charAt(0) === '$' && trimmed.charAt(1) === '{' && trimmed.charAt(trimmed.length-1) === '}') {
      return true;
    } else {
      return false;
    }
  }

  // looks for ${} values in nodes
  // these values are loaded from the board
  // if no {} are found the original rawValue is returned
  // spaces are trimmed from the value before checking for {} in case of a mistaked space in the GUI
  // however this trim() has no effect if {} are not found
  detectAndLoadBraceValues(rawValue: string): string | any {
    const rawTrimmed = rawValue.trim();
    if(this.scanForVariable(rawTrimmed)) {

    } else {
      return rawValue;
    }

    let lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

    const typed = lookup.split(':');

    let doType = false;

    if( typed.length === 2 ) {
      // found exactly one :

      // using the length of the first argument
      // trim off the conversion
      lookup = lookup.slice(0,typed[0].length);

      // set a flag for below
      doType = true;
    }

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`looking up: '${lookup}'`);
    }

    const ls = lookup.split('.');

    let unpack = this.bb;

    for(let i = 0; i < ls.length; i++) {
      let layer = ls[i];
      if(unpack[layer] == undefined) {
        this.warning(`got 'undefined' value from blackboard when looking for '${layer}' of '${rawValue}'`);
        return undefined;
      }

      unpack = unpack[layer]
    }

    if( doType ) {
      return this.doTypeConversion(typed[1], unpack);
    } else {
      return unpack;
    }
  }

  // returns true if successful
  // rawValue is the path
  // value is the value to write there
  detectAndStoreBraceValues(rawValue: string, value: any): boolean {
    const rawTrimmed = rawValue.trim();
    if(this.scanForVariable(rawTrimmed)) {

    } else {
      return false;
    }

    let lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

    const typed = lookup.split(':');

    let doType = false;

    if( typed.length === 2 ) {
      // found exactly one :

      // using the length of the first argument
      // trim off the conversion
      lookup = lookup.slice(0,typed[0].length);

      // set a flag for below
      doType = true;
    }

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`store looking up: '${lookup}'`);
    }

    const ls = lookup.split('.');

    let unpack = this.bb;
    
    let layer = ls[0];
    let i = 0;
    for(i = 0; i < ls.length-1; i++) {
      layer = ls[i];
      if(unpack[layer] == undefined) {
        if( this.warnWhenCreatingNewObjects ) {
          this.warning(`making new object on blackboard '${layer}' while writing to '${rawValue}'`);
        }
        unpack[layer] = {};
      }

      unpack = unpack[layer]
    }


    // istanbul ignore if
    if( unpack == undefined ) {
      this.warning("Internal Error: Loop in detectAndStoreBraceValues() failed to set undefined for '${rawValue}'");
      return false;
    }

    if( doType ) {
      unpack[ls[i]] = this.doTypeConversion(typed[1], value);
    } else {
      unpack[ls[i]] = value;
    }


    return true;
  }

  buildInObject(node: any, found: any) {
    let objIn = {};

    const letin = {
      "in":true,
      "inout":true,
    }

    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( port.dir in letin ) {

        let rawValue;
        // does the node have a value for this argument
        if( port.name in node.args && (node.args[port.name] !== '') ) {
          rawValue = node.args[port.name];
        } else {
          // use the default
          rawValue = port.default != undefined?port.default:'';
        }

        const loaded = this.detectAndLoadBraceValues(rawValue);

        objIn[port.name] = loaded;
      }
    }

    return objIn;
  }

  buildInArgs(node: any, found: any) {
    let arrIn: any[] = [];

    const letin = {
      "in":true,
      "inout":true,
    }

    let idx = 0;
    let foundNext = true;
    while(foundNext) {
      foundNext = false;
      const key = `_in_${idx}`;
      for(let i = 0; i < found.ports.length; i++) {
        const port = found.ports[i];
        if( (port.dir in letin) && port.name === key  ) {

           let rawValue;
           if( (node.args[port.name] !== '') ) {
             rawValue = node.args[port.name];
           } else {
             // use the default
             rawValue = port.default != undefined?port.default:'';
           }
           const loaded = this.detectAndLoadBraceValues(rawValue);

           arrIn.push(loaded);
           foundNext = true;
           idx++;
           break;
        }
      }
    }
    return arrIn;
  }

  // only call this when the node has returned success
  handleOutObject(node: any, found: any, result: any) {
    const letout = {
      "out":true,
      "inout":true,
    };

    // debugger;

    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( port.dir in letout ) {

        let rawValue;
        // does the node have a value for this argument
        if( port.name in result ) {
          rawValue = node.args[port.name];
        } else {
          if( this.warnWhenOutputNotFilled ) {
            this.warning(`Calling function '${node.name}' did not set value for output port 'port.name'`);
          }
          continue; // function did not provide an output for this port
        }

        const gotBack = result[port.name];

        // istanbul ignore if
        if( gotBack == undefined ) {
          this.warning(`${rawValue} was not found in result object`);
          continue;
        }

        this.detectAndStoreBraceValues(rawValue, gotBack);

        // istanbul ignore if
        if( this.printCall ) {
          console.log(`set ${port.name} to ${rawValue} , ${gotBack}`);
        }

      }
    }
  }

  handleOutArgs(node: any, found: any, result: any) {
    const letout = {
      "out":true,
      "inout":true,
    };

    const key = '_out_0';

    // let worked: boolean = false;


    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( (port.dir in letout) && port.name === key ) {

        const rawValue = node.args[port.name];

        const gotBack = result;

        // istanbul ignore if
        if( this.printWrites ) {
          console.log(`writing ${gotBack} to ${rawValue}`);
        }

        const worked = this.detectAndStoreBraceValues(rawValue, gotBack);
        
        if( !worked ) {
          this.warning(`Action node '${node.name}' tried to use the string '${rawValue}' as a destination variable for the output port '${key}'`);
        }
      }
    }
  }

  async callAction(node: any): Promise<boolean> {

    const n: string = node.name;

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`calling ${n}`);
    }

    if( !(n in this.bb) ) {
      this.warning(`Function named '${n}' was not found on blackboard.`);
      return false;
    }

    const found = this.functionDescriptions[n];

    let result;
    let useInArgsMode = false;
    let useOutArgsMode = false;

    if( !found ) {
      // node.name isn't found in functionDescriptions
      // not sure how possible it is to get here
      this.warning(`Action block '${n}'' was not found in '<TreeNodesModel>'.  Probably malformed XML.`);
      return false;
      // result = await this.bb[n]();
    } else {


      for(let i = 0; i < found.ports.length; i++) {
        const port = found.ports[i];
        if( port.name == '_in_0' ) {
          useInArgsMode = true;
        }
        if( port.name == '_out_0' ) {
          useOutArgsMode = true;
        }
      }

      if( useInArgsMode ) {
        const arrIn = this.buildInArgs(node, found);
        
        result = await this.bb[n](...arrIn);

      } else {
        const objIn = this.buildInObject(node, found);

        result = await this.bb[n](objIn);
      }

    }




    if( this.warnUndefinedReturn && result == undefined ) {
      this.warning(`${n} returned 'undefined' and thus will fail`);
    }

    // if result was an object
    // pull the ret key
    // this allows us to deal with out / inout
    let ret;
    if( typeof result !== 'object' ) {
      ret = result;
    } else {
      ret = result.ret;

      
      // always process outputs even if node returned failure
      if( !useOutArgsMode ) {
        this.handleOutObject(node, found, result);
      }
    
    }

    if( useOutArgsMode ) {
      this.handleOutArgs(node, found, result);
    }







    // check truthiness, force into boolean
    if( ret ) {
      // console.log(`... with success`);
      return true;
    } else {
      // console.log(`... with failure`);
      return false;
    }
  }

  handleSetBlackboard(node: any): boolean {

    const rawValue2 = node.args['output_key'];

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`calling setBlackboard ${rawValue2}`);
    }


    const rawValue = node.args['value'];
    const loaded = this.detectAndLoadBraceValues(rawValue);
    const worked = this.detectAndStoreBraceValues(rawValue2, loaded);

    // istanbul ignore if
    if( !worked ) {
      this.warning(`handleSetBlackboard node '${node.path}' tried to use the string '${rawValue}' as a destination variable`);
    }

    return true;
  }

  // see https://medium.com/@kenny.hom27/breadth-first-vs-depth-first-tree-traversal-in-javascript-48df2ebfc6d1#fe0b
  // this is a DFS through the behavior tree (this.exe)
  // we save the current level into the pending[]
  // we use ptr as an index into pending[]
  // based on the node type we destroy or continue our DFS through
  // this requires is to make a copy of exe every time we run through
  // this probably isn't that expensive
  async execute(): Promise<void> {

    if( this.destroyed ) {
      throw new Error("can't call execute() after AsyncBehaviorTree is destroyed");
    }

    let collection = merge([], this.exe);

    const nesting = this.nestingTypes;

    const pending: any[][] = [[]];
    const types: string[] = [];
    const anypass: boolean[] = [];
    const meta: any[] = [];
    const hist: any[] = [];
    const visited: any[] = [];
    let ptr = -1;

    const idleHistory = (): void => {
      for(let n of hist[ptr]) {
        // console.log('popLevel', n);
        this.logTransition2(n, 0);
      }
      hist[ptr] = [];
    }

    const idleHistoryUp = (success: boolean): void => {
      idleHistory();
      debugger;
      let ptr2 = ptr;

      while(ptr2 >= 0 && pending[ptr2].length == 0) {
        for(let n of hist[ptr2-1]) {
          this.logTransition2(n, success?2:3);
        }
        hist[ptr2] = [];

        ptr2--;
      }
    }

    const popLevel = (success: boolean): void => {
      // idleHistoryUp(success);

      pending.pop();
      types.pop();
      anypass.pop();
      meta.pop();

      
      hist.pop();


      ptr--;

    }

    const failUp = (og: any): void => {

      let node = og;

      while(ptr >= 0) {

        // fail all the way up
        if( types[ptr] === 'sequence' || types[ptr] === 'repeat' ) {
          popLevel(false);
          node = this.getNodeParent(node);
          this.logTransition(node, true, false);
        } else if( types[ptr] === 'retryuntilsuccesful' ) {
          if( meta[ptr].retry > 0 ) {
            idleHistory();
            // this.logTransition(node, anypass[ptr], false);
            break;
          }
          // this.logTransition(node, anypass[ptr], false);
          popLevel(false);
        } else if( types[ptr] === 'fallback' || types[ptr] === 'inverter' || types[ptr] === 'forcesuccess' || types[ptr] === 'forcefailure' ) {
          node = this.getNodeParent(node);
          // this.logTransition(node, true, false);
          // do nothing, see logic below
          break;
        } else {
          // istanbul ignore next
          throw new Error(`unhandled pop in failup: ${types[ptr]}`);
        }
      }
    }

    
    while( (ptr > 0) || (ptr > -1 && pending[ptr].length) || collection.length) {
      let skipThisNode = false;
      // debugger;

      // istanbul ignore if
      if( this.destroyed ) {
        return;
      }

      let node;
      if( ptr > -1 && pending[ptr].length ) {
        node = pending[ptr].shift();

        // if we are in a repeat node, 
        // we want to "re-inject" the node into the pending list
        // until we are at the last repeat

        // console.log(meta[ptr]);
        if( 'repeat' in meta[ptr] ) {
          if( meta[ptr].repeat > 1 ) {
            // console.log(`re-inject for ${meta[ptr].repeat}`);
            pending[ptr].unshift(node);
            meta[ptr].repeat--;
          }
        } else if( 'retry' in meta[ptr] ) {
          if( anypass[ptr] ) {
            meta[ptr].retry = 0;
            skipThisNode = true;
          } else if( meta[ptr].retry > 1 ) {
            pending[ptr].unshift(node);
            meta[ptr].retry--;
          } else if( meta[ptr].retry <= 1 )  {
            // console.log('else case');
            meta[ptr].retry = 0;
          }
        }


      } else {
        node = collection.shift();
      }

      visited.push(node);

      // istanbul ignore if
      if(node == undefined) {
        throw new Error(`node cannot be undefined here`);
      }

      // istanbul ignore if
      if( this.printCall ) {
        console.log(`visit ${node.w}`);
      }
      // console.log(node);

      if( skipThisNode ) {
        // do nothing
      } else if( nesting.has(node.w) ) {

        if( ptr >= 0 ) {
          hist[ptr].push(node);
        } else {
          console.log("skipping pushing", node);
        }

        ptr++;

        // istanbul ignore if
        if( pending[ptr] && pending[ptr].length ) {
          throw new Error(`pending[ptr] cannot have nodes at creation`);
        }

        pending[ptr] = [];
        types  [ptr] = node.w;
        anypass[ptr] = false;
        meta   [ptr] = {};
        hist   [ptr] = [];

        if( node.w === 'repeat' ) {
          meta[ptr].repeat = parseInt(this.detectAndLoadBraceValues(node.args.num_cycles), 10);
        } else if( node.w === 'retryuntilsuccesful' ) {
          meta[ptr].retry = parseInt(this.detectAndLoadBraceValues(node.args.num_attempts), 10);
        }

        // if( node.path === '0.1') {
        //   debugger;
        // }

        pending[ptr].unshift(...node.seq);

        this.logTransition(node, false);

        // istanbul ignore if
        if( this.printCall ) {
          console.log(`nesting ${node.w}`);
        }
      } else if (node.w === 'action') {

        // console.log(meta[ptr]);

        this.logTransition2(node, 1);

        hist[ptr].push(node);

        const res = await this.callAction(node);

        if( this.destroyed ) {
          return;
        }

        if( node.path === '0.1') {
          debugger;
        }
        
        this.logTransition2(node, res?2:3);


        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          failUp(node);
        }

        if( node.path === '0.0.1.1.0' && meta[ptr].retry === 1 ) {
          // console.log(types[ptr], '===', meta[ptr].retry);
        }

      } else if (node.w === 'setblackboard') {

        // console.log(meta[ptr]);

        const res = this.handleSetBlackboard(node);

        this.logTransition(node, false, true);

        anypass[ptr] = true;

      } else if (node.w === 'condition') {
        hist[ptr].push(node);
        const res = this.evaluateCondition(node.name);

        this.logTransition(node, false, res);


        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          // console.log(types[ptr], node);
          failUp(node);
        }

      } else if (node.w === 'alwaysfailure') {
        const res = false;

        this.logTransition(node, false, res);

        failUp(node);

      } else if (node.w === 'alwayssuccess') {
        const res = true;

        this.logTransition(node, false, res);

        anypass[ptr] = true;

      } else {
        // istanbul ignore next
        throw new Error(`Unknown walk type: ${node.w}`);
      }

      // if we are empty we need to decide pop behavior
      while( (ptr > 0 && pending[ptr].length == 0) || (ptr >= 0 && types[ptr] === 'fallback' && anypass[ptr]) ) {

        const earlyFallback = (ptr >= 0 && types[ptr] === 'fallback' && anypass[ptr]) && pending[ptr].length !== 0;

        if( earlyFallback ) {
          debugger;
          const anySaved = anypass[ptr];
          if( anySaved ) {
            popLevel(true);
            continue;
          } else {
            break;
          }
        }

        // debugger;
        if( !earlyFallback && types[ptr] === 'fallback' ) {
          debugger;
          const anySaved = anypass[ptr];
          popLevel(true);
          console.log(this.getNodeParent(node));
          // this.logTransition(this.getNodeParent(node), true, true);
          if( anySaved ) {
            // we got at least 1 pass in our fallback, just move on
          } else {
            // still want the pop, above, but now time to fail up to
            // the next level
            failUp(node);
            // this.logTransition(node, true, false);
          }
        } else if( types[ptr] === 'inverter' ) {
          const anySaved = anypass[ptr];
          this.logTransition(this.getNodeParent(node), true, !anySaved);
          popLevel(true);
          if( anySaved ) {
            failUp(node);
            // this.logTransition(node, true, false);
          }
        } else if( types[ptr] === 'sequence' || types[ptr] === 'forcesuccess' ) {
          debugger;
          popLevel(true);
          // this.logTransition(this.getNodeParent(node), true, true);
          // we are popping a sequence if we get here the sequence succeded
          // we must mark anypass as true for the new level for #35 (part 2)
          anypass[ptr] = true;
        } else if( types[ptr] === 'repeat') {
          popLevel(true);
          this.logTransition(this.getNodeParent(node), true, true);
        } else if( types[ptr] === 'retryuntilsuccesful') {
          if( anypass[ptr] ) {
            popLevel(true);
          } else {
            // maybe able to delete
            // istanbul ignore next
            failUp(node);
          }
          this.logTransition(this.getNodeParent(node), anypass[ptr], true);
        } else if( types[ptr] === 'forcefailure' ) {
          popLevel(true);
          this.logTransition(this.getNodeParent(node), true, false);
          anypass[ptr] = false;
          failUp(node);
        } else {
          // istanbul ignore next
          if( !earlyFallback ) {
            // istanbul ignore next
            throw new Error(`Unknown types in finish pending: ${types[ptr]}`);
          }
        }
        // break; // uncomment to cause issue #35
      }
    } // while(...)
  } // execute


  walkTree(cb: any): Promise<void> {

    // istanbul ignore if
    if( this.destroyed ) {
      throw new Error("can't call execute() after AsyncBehaviorTree is destroyed");
    }

    let collection = merge([], this.exe);

    const nesting = this.nestingTypes;

    const pending: any[][] = [[]];
    const types: string[] = [];
    const anypass: boolean[] = [];
    let ptr = -1;

    const popLevel = (): void => {
      pending.pop();
      types.pop();
      anypass.pop();
      ptr--;
    }

    
    while( (ptr > 0) || (ptr > -1 && pending[ptr].length) || collection.length) {
      // debugger;

      // istanbul ignore if
      if( this.destroyed ) {
        return;
      }

      let node;
      if( ptr > -1 && pending[ptr].length ) {
        node = pending[ptr].shift();
      } else {
        node = collection.shift();
      }

      // istanbul ignore if
      if(node == undefined) {
        throw new Error(`node cannot be undefined here`);
      }

      if( nesting.has(node.w) ) {
        ptr++;

        // istanbul ignore if
        if( pending[ptr] && pending[ptr].length ) {
          throw new Error(`pending[ptr] cannot have nodes at creation`);
        }

        pending[ptr] = [];
        types  [ptr] = node.w;
        anypass[ptr] = false;

        cb(node);

        pending[ptr].unshift(...node.seq);
      } else if (node.w === 'action') {

        // istanbul ignore if
        if( this.destroyed ) {
          return;
        }

        cb(node);

      } else if (node.w === 'condition') {

        cb(node);

      } else {
        // istanbul ignore next
        throw new Error(`Unknown walk type: ${node.w}`);
      }

      // if we are empty we need to decide pop behavior
      while( (ptr > 0 && pending[ptr].length == 0) ) {
        
        if( nesting.has(types[ptr]) ) {
          popLevel();
        } else {
          // istanbul ignore next
          throw new Error(`Unknown types in finish pending: ${types[ptr]}`);
        }
      }
    } // while(...)
    return;
  } // walkTree

  pathForArray(ps: number[]): string {
    return ps.join('.');
  }

  arrayForPath(path: string): number[] {
    const ps = path.split('.').map(x=>parseInt(x,10));
    return ps;
  }

  accessNodeByPath(path: string): any {
    const ps = path.split('.').map(x=>parseInt(x,10));
    return this.accessNodeByPathArray(ps);
  }

  // pass a path as an array
  accessNodeByPathArray(ps: number[]): any {

    let exe: any = this.exe;

    for(let j = 0; j < ps.length; j++) {
      const i = ps[j];
        
      if( 'seq' in exe ) {
        exe = exe.seq[i]
      } else {
        exe = exe[i];
      }

    }

    return exe;
  }

  // get the parent of a string path (as a string)
  getPathParent(path: string): string | undefined {
    let array = this.arrayForPath(path);
    if( array.length <= 1 ) {
      return undefined;
    }

    array.pop();

    return this.pathForArray(array);
  }

  getNodeParent(node: any): any {
    const parentPath = this.getPathParent(node.path);
    // istanbul ignore if
    if( parentPath == undefined ) {
      return undefined;
    }

    return this.accessNodeByPath(parentPath);
  }


  // ps is a string here (annoying)
  // called by loadPath
  private writePathToNode(node, type, pss, j): void {

    let ps = pss.map(x=>parseInt(x,10));

    let slc = ps.slice(0,j);

    node.path = slc.join('.');

    this.prevNodeState[node.path] = 0;
  }

  // note types with ports
  portedNodes: Set<string> = new Set([
    'action',
    'repeat',
    'retryuntilsuccesful',
    'setblackboard',
  ]);


// type: sequence path: 0.0. x: go1
// type: sequence path: 0.1.0. x: stay1
// type: sequence path: 0.2. x: go2
  
  // x is the string name of the function which will exist on the blackboard
  loadPath(_path, hierarchy: string, x: string, props: any): void {

    let exe: any = this.exe;

    const ps = _path.split('.');
    const hs = hierarchy.split('.');
    const nesting = this.nestingTypes;

    // istanbul ignore if
    if( ps.length != hs.length ) {
      throw new Error('illegal lengths passed to loadPath()');
    }

    // istanbul ignore if
    if( this.printParse || this.logLoadPath ) {
      console.log(`path: ${_path} fn: ${x} h: ${hierarchy}`);
    }

    // loop through the parts of the path
    // j is index
    // i is the literal number
    for(let j = 1; j < ps.length; j++) {


      // if we have '0.1.2.3'
      // i is one of the numbers beween periods
      // i progresses as we loop

      const i = parseInt(ps[j-1], 10);

      const type = hs[j];

      // console.log(hs);

      if( this.portedNodes.has(type) && nesting.has(type) ) {
        if( exe[i] == undefined ) {

          let args = {};
          for( let a in props ) {
            // istanbul ignore if
            if (a==='ID') {
              continue;
            }
            args[a] = props[a];
          }

          exe[i] = {w:type,name:x,args,seq:[]};
          this.writePathToNode(exe[i], type, ps, j);
        }

      } else if( nesting.has(type) ) {
        if( exe[i] == undefined ) {
          exe[i] = {w:type,seq:[]};
          this.writePathToNode(exe[i], type, ps, j);
        }
      } else if( this.portedNodes.has(type) ) {

        let args = {};
        for( let a in props ) {
          if (a==='ID') {
            continue;
          }
          args[a] = props[a];
        }

        exe[i] = {w:type,name:x,args};
        this.writePathToNode(exe[i], type, ps, j);

      } else if( type === 'condition' || type === 'alwaysfailure' || type === 'alwayssuccess' || type === 'forcefailure' ) {
        exe[i] = {w:type,name:x};
        this.writePathToNode(exe[i], type, ps, j);
      } else {
        // istanbul ignore next
        throw new Error(`loadPath()[3] Unknown type: ${type}`);
      }

      // confusing but this is
      // how we nest down and then loop
      if( nesting.has(type) ) {
        exe = exe[i].seq;
      } else if( type === 'action' ) {
        exe = exe[i]
      }


    }
  }


  parseResults(err, result) {

    // delete result.root.TreeNodesModel;
    // delete result.root.BehaviorTree;
    // delete result.root.$$[1];
    // delete result.root.$$[0].Sequence;
    // delete result.root.$$[0].Action;
    // delete result.root.$$[0].$$[0].Action;
    // delete result.root.$$[0].$$[0].Sequence;
    // delete result.root.$$[0].$$[0].$$[1].Action;
    // delete result.root.$$[0].$$[0].$$[1].Sequence;

    // istanbul ignore if
    if( this.debugDoStrip ) {
      this.stripTree(result.root);
    }

    // istanbul ignore if
    if( this.printParse ) {
      console.log("prune");
    }

    this.p = result;

    // istanbul ignore if
    if( this.printParse ) {
      console.log(this.p);
      console.log(JSON.stringify(result));
    }

    const p = this.p;

    this.grabFunctionParams(p.root);


    let f = p.root.$$[0].$$[0];

    this.recurse(f, 0, "0.", "root.");

    // istanbul ignore if
    if( this.printParse ) {
      console.log(JSON.stringify(this.exe));
      console.log('done');
    }
  }


  // lookups for the recurse function
  private _rcr_with_id: Set<string> = new Set([
    'action',
    'condition',
  ]);

  private _rcr_without_id: Set<string> = new Set([
    'forcefailure',
    'alwaysfailure',
    'alwayssuccess',
    'repeat',
    'setblackboard',
    'retryuntilsuccesful',
  ]);


  // called during initial parse of tree
  // this is used to convert the xml to this.exe (via loadPath)
  recurse(t: any, depth: number, path: string, hierarchy: string): void {
    // if(depth === 0) {
    //   debugger;
    // }

    // istanbul ignore if
    if(this.logRecurse) {
      console.log(`Depth ${depth}, path ${path}, hier ${hierarchy}`);
    }

    const props = t['$'];
    const children = t['$$'];
    const tag = t['#name'];
    const taglow = tag.toLowerCase();
    const nesting = this.nestingTypes;

    // console.log('key ' + key);

    if( nesting.has(taglow) ) {
      // debugger;
      for(let i = 0; i < children.length; i++) {

        this.loadPath(path+'0', hierarchy+taglow, "", props);

        const pp = path+i+'.';
        // console.log("calling with path: "+ pp);

        this.recurse(children[i], depth+1, pp, hierarchy+taglow+'.');
      }
    } else if( this._rcr_with_id.has(taglow) ) {
      // debugger;
      const fn = props.ID;
      // let a = t[key]; // xml parser likes to put things in 1 depth array
      // this.recurseSeq(t[key][0], depth+1);
      this.loadPath(path+'0', hierarchy+taglow, fn, props);

    } else if ( this._rcr_without_id.has(taglow) ) {

      this.loadPath(path+'0', hierarchy+taglow, "", props);

    } else {

      // istanbul ignore next
      let msg;
      // istanbul ignore next
      if(taglow in plannedSupport && plannedSupport[taglow]) {
        msg = 'planned support for'
      } else {
        msg = 'no plan to support'
      }

      // istanbul ignore next
      throw new Error(`Unknown tag: ${tag}.  There is ${msg} this tag in the future!`);
    }

  }

  functionDescriptions = {};

  grabFunctionParamsInternal(t: any) {

    const fns = this.functionDescriptions;

    const lut = {
      'input_port': 'in',
      'inout_port': 'inout',
      'output_port': 'out',
    };



    for(let i = 0; i < t.length; i++) {
      const c = t[i];

      const name = c.$.ID;

      if( c.$$ != undefined ) {
        fns[name] = {fn:name, ports:[]};
        for(let j = 0; j < c.$$.length; j++) {
          const arg: any = c.$$[j];
          const argname = arg.$.name;
          const dir = lut[arg['#name']];
          let build: any = {name:argname,dir:dir};
          if( arg.$.default != undefined ) {
            build.default = arg.$.default;
          }
          fns[name].ports.push(build);
        }
      } else {
        fns[name] = {fn:name, ports:[]};
      }
    }
  }

  grabFunctionParams(t: any) {

    if(true) {

      let props = t['$'];
      let children = t['$$'];
      let tag = t['#name'];

      // console.log('key ' + key);

      if( false) {
      } else {
        for(let i = 0; i < children.length; i++) {
          if( children[i]['#name'] === 'TreeNodesModel' ) {
            this.grabFunctionParamsInternal(children[i].$$);
            return;
          }
        }
      }
    }
  }

  // this.grabParams(action) {

  // }

  // when the parser is called with explicitChildren: true, preserveChildrenOrder: true,
  // it returns the information in two formats in the same object
  // this is annoying as I want to see the structure using json stringify
  // so this function strips one copy of the data (the copy in the format I cannot use)

  // istanbul ignore next
  stripTree(result: any) {
    let doomed: string[] = [];
    
    if(Array.isArray(result)) {
      for(let a of result) {
        this.stripTree(a);
      }
      return;
    }


    for(let key in result) {
      if (!result.hasOwnProperty(key)) {
        continue;       // skip this property
      }

      if( key === '$' || key === '$$' || key === '#name' || key === 'name' || key === 'ID' || key === 'default' ) {
        continue;
      }

      doomed.push(key);
    }

    for(let d of doomed) {
      delete result[d];
    }


    for(let key in result) {
      if (!result.hasOwnProperty(key)) {
        continue;       // skip this property
      }

      if( key === '$' || key === '$$' ) {
      } else {
        continue;
      }

      this.stripTree(result[key]);

    }

  }

  getActionNodes(): string[] {

    const s: Set<string> = new Set();

    this.walkTree((node)=>{
      if( node.w === 'action' ) {
        s.add(node.name);
      }
    });

    return Array.from(s);
  }

  getConditionNodes(): string[] {

    const s: Set<string> = new Set();

    this.walkTree((node)=>{
      if( node.w === 'condition' ) {
        s.add(node.name);
      }
    });

    return Array.from(s);
  }

  // transition logger
  // not a text logger
  logger: ABTLoggerBase;

  logPath: string;

  async setFileLogger(l: ABTWasmLogger, path: string): Promise<void> {
    this.logger = l;

    await l.start();
    await l.setFilePath(path);
    this.logPath = path;

    l.registerActionNodes(this.getActionNodes());
    l.registerConditionNodes(this.getConditionNodes());
    l.parseXML(this.rawXml);

    this.writeNodeUID();
  }


  zmq: ABTZmqLogger;


  // istanbul ignore next
  async setZmqLogger(l: ABTWasmLogger, z: ABTZmqLogger): Promise<void> {
    this.logger = l;
    this.zmq = z;

    await l.start(); // FIXME

    this.zmqTransitions = 0;
    l.writeToCallback(this.zmqGotTransition.bind(this));


    await l.start(); // FIXME
    l.registerActionNodes(this.getActionNodes());
    l.registerConditionNodes(this.getConditionNodes());
    l.parseXML(this.rawXml);

    this.writeNodeUID();
  }

  zmqTransitions: number = 0;

  async setJsonLogger(l: ABTJsonLogger): Promise<void> {
    this.logger = l;

    l.parseXML(this.rawXml);

    // the json logger does not have access to the wasm
    // this means that we need to choose unique id's
    // for each node without having access to wasm
    // in order to do this we feed all of the nodes in
    // during the pre phase.  This gives the logger
    // a preview of all the node paths
    // then below when we call writeNodeUID we can
    // guarentee a unique ID for each path without wasm
    // when the json logger sends data over the WS to
    // the server, these ids will be translated
    this.walkTree(l.preWalkTree.bind(l));

    this.writeNodeUID();

  }

  // istanbul ignore next
  private zmqGotTransition(buf: Uint8Array) {
    // if( this.zmqTransitions === 1 ) {

    //   let flushList = [
    //   [1,0],
    //   [2,2],
    //   [3,3],
    //   [4,3],
    //   [5,2],
    //   [6,2],
    //   [7,2],
    //   [8,3],
    //   [9,1],
    //   // [9,2],
    //   ];

    //   this.zmq.dataCallback(buf, flushList);

    // } else {
    //   this.zmq.dataCallback(buf, undefined);
    // }

    this.zmq.dataCallback(buf, undefined);

    this.zmqTransitions++;
  }



  // walks the tree and writes node UID
  // this is only done if there is a file or zmq logger
  private writeNodeUID(): void {

    this.walkTree(this.writeNodeUIDInternal.bind(this));

  }

  // called by writeNodeUID
  private writeNodeUIDInternal(node: any): void {

    // use the path to lookup the uid of the node
    const uid = this.logger.getForPath(node.path);

    // "c" name aka the name that c++ got for this node
    const cn = this.logger.getNameForUID(uid);

    const cnlow = cn.toLowerCase();

    if( this.nestingTypes.has(cnlow) ) {
      // if it's a nesting node, the name is the node type, so we can't check
    } else if( cn === node.name ) {
      // everything is ok
    } else {
      // istanbul ignore next
      throw new Error(`Error for path ${node.path}, ${cn} !== ${node.name}`);
    }

    // for "reasons" the node passed to this function is a copy, not the actual node
    //

    // this is the real node
    const real = this.accessNodeByPath(node.path);

    // write the uid from c to the real node
    real.uid = uid;

    // console.log(`${node.path}: ${uid} (${cn})`);

  //     getNameForUID(u: number): string;
  }

  //    idle: 0,
  //    running: 1,
  //    success: 2,
  //    failure: 3

  prevNodeState: any = {};

  logPrevState: number = 0;

  private logTransition2(node: any, status: number): void {
    if( !this.logger ) {
      return;
    }
    let prev = this.prevNodeState[node.path];
    this.logger.logTransition(node.uid, prev, status);
    this.prevNodeState[node.path] = status;
  }

  private logTransition(node: any, pop: boolean, result?: boolean): void {
    if( !this.logger ) {
      return;
    }

    if( node.path === '0.0.1' ) {
      debugger;
    }

    let prev = this.prevNodeState[node.path];

    const nest = this.nestingTypes.has(node.w);

    if( nest ) {

      if( !pop ) {
        this.logger.logTransition(node.uid, prev, 1);
        this.prevNodeState[node.path] = 1;
      } else {

        let cur = 3;

        if( !!result ) {
          cur = 2;
        }

        // if( node.w === 'fallback' ) {
        //   cur = 0;
        // }
      
        this.logger.logTransition(node.uid, prev, cur);
        this.prevNodeState[node.path] = cur;

      }

    } else {

      let cur = 3;

      if( !!result ) {
        cur = 2;
      }

      this.logger.logTransition(node.uid, prev, cur);
      this.prevNodeState[node.path] = cur;
    }

  }

}


export {
AsyncBehaviorTree
}
