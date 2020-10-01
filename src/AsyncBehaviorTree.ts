var xml2js = require('xml2js');
const merge = require('deepmerge');

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


export interface ABTLogger {
  start(): Promise<void>;
  reset(): void;
  setFilePath(path: string): Promise<void>;
  parseXML(xml: string): void;
  registerActionNodes(ns: string[]): void;
  registerConditionNodes(ns: string[]): void;
  logTransition(uid: number, prev_status: number, status: number): void;
  logTransitionDuration(uid: number, prev_status: number, status: number, duration_ms: number): void;
  getNameForUID(u: number): string;
  getForPath(path: string): number;
  getForPathArray(ps: number[]): number;
  writeToCallback(cb: IFunctionWriterCb): void;
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
};

// true means I plan to support
// false means I do not plan
// right now I don't know of a way to support reactive nodes
// maybe in the future
const plannedSupport = {
  'alwaysfailure': true,
  'alwayssuccess': true,
  'setblackboard': true,
  'retryuntilsuccesful': true,
  'forcefailure': true,
  'keeprunninguntilfailure': true,
  'switch2': true,
  'switch3': true,
  'switch4': true,
  'switch5': true,
  'switch6': true,
  'blackboardcheckdouble': true,
  'blackboardcheckint': true,
  'blackboardcheckstring': true,
  'repeat': true,
  'timeout': true,
  'subtree': true,
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

  nestingTypes: any = {
    'sequence':true,
    'fallback':true,
    'inverter':true,
    'forcesuccess':true,
  };

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

  scanForVariable(trimmed: string): boolean {
    if(trimmed.charAt(0) === '$' && trimmed.charAt(1) === '{' && trimmed.charAt(trimmed.length-1) === '}') {
      return true;
    } else {
      return false;
    }
  }

  // looks for {} values in nodes
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

    const lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`looking up: '${lookup}'`);
    }

    const ls = lookup.split('.');

    // console.log(ls);

    let unpack = this.bb;

    for(let i = 0; i < ls.length; i++) {
      let layer = ls[i];
      if(unpack[layer] == undefined) {
        this.warning(`got 'undefined' value from blackboard when looking for '${layer}' of '${rawValue}'`);
        return undefined;
      }

      unpack = unpack[layer]
    }

    return unpack;
  }

  // returns true if successful
  detectAndStoreBraceValues(rawValue: string, value: any): boolean {
    const rawTrimmed = rawValue.trim();
    if(this.scanForVariable(rawTrimmed)) {

    } else {
      return false;
    }

    const lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

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

    unpack[ls[i]] = value;

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
    let ptr = -1;

    const popLevel = (success: boolean): void => {
      pending.pop();
      types.pop();
      anypass.pop();
      ptr--;
    }

    const failUp = (og: any): void => {

      let node = og;

      while(ptr >= 0) {

        // fail all the way up
        if( types[ptr] === 'sequence' ) {
          popLevel(false);
          node = this.getNodeParent(node);
          this.logTransition(node, true, false);

        } else if( types[ptr] === 'fallback' || types[ptr] === 'inverter' || types[ptr] === 'forcesuccess' ) {
          node = this.getNodeParent(node);
          this.logTransition(node, true, false);
          // do nothing, see logic below
          break;
        } else {
          // istanbul ignore next
          throw new Error(`unhandled pop in failup: ${types[ptr]}`);
        }
      }
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

      if( node.name == "isFull" ) {
        debugger;
      }

      // istanbul ignore if
      if(node == undefined) {
        throw new Error(`node cannot be undefined here`);
      }

      if( node.w in nesting ) {
        ptr++;

        // istanbul ignore if
        if( pending[ptr] && pending[ptr].length ) {
          throw new Error(`pending[ptr] cannot have nodes at creation`);
        }

        pending[ptr] = [];
        types  [ptr] = node.w;
        anypass[ptr] = false;

        pending[ptr].unshift(...node.seq);

        this.logTransition(node, false);

        // istanbul ignore if
        if( this.printCall ) {
          console.log(`nesting ${node.w}`);
        }
      } else if (node.w === 'action') {

        const res = await this.callAction(node);

        if( this.destroyed ) {
          return;
        }

        this.logTransition(node, false, res);

        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          failUp(node);
        }



      } else if (node.w === 'condition') {
        const res = this.evaluateCondition(node.name);

        this.logTransition(node, false, res);

        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          failUp(node);
        }


      } else {
        // istanbul ignore next
        throw new Error(`Unknown walk type: ${node.w}`);
      }

      // if we are empty we need to decide pop behavior
      while( (ptr > 0 && pending[ptr].length == 0) ) {
        // debugger;
        if( types[ptr] === 'fallback' ) {
          const anySaved = anypass[ptr];
          popLevel(true);
          this.logTransition(this.getNodeParent(node), true, true);
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
          popLevel(true);
          this.logTransition(this.getNodeParent(node), true, false);
          if( anySaved ) {
            failUp(node);
            // this.logTransition(node, true, false);
          }
        } else if( types[ptr] === 'sequence' || types[ptr] === 'forcesuccess' ) {
          popLevel(true);
          this.logTransition(this.getNodeParent(node), true, true);
          // we are popping a sequence if we get here the sequence succeded
          // we must mark anypass as true for the new level for #35 (part 2)
          anypass[ptr] = true;
        } else {
          // istanbul ignore next
          throw new Error(`Unknown types in finish pending: ${types[ptr]}`);
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

      if( node.w in nesting ) {
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
        
        if( types[ptr] in nesting ) {
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
  }


// type: sequence path: 0.0. x: go1
// type: sequence path: 0.1.0. x: stay1
// type: sequence path: 0.2. x: go2

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

      if( type in nesting ) {
        if( exe[i] == undefined ) {
          exe[i] = {w:type,seq:[]};
          this.writePathToNode(exe[i], type, ps, j);
        }
      } else if( type === 'action' ) {

        let args = {};
        for( let a in props ) {
          if (a==='ID') {
            continue;
          }
          args[a] = props[a];
        }

        exe[i] = {w:type,name:x,args};
        this.writePathToNode(exe[i], type, ps, j);

      } else if( type === 'condition' ) {
        exe[i] = {w:type,name:x};
        this.writePathToNode(exe[i], type, ps, j);
      } else {
        // istanbul ignore next
        throw new Error(`loadPath()[3] Unknown type: ${type}`);
      }

      // confusing but this is
      // how we nest down and then loop
      if( type in nesting ) {
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

    if( taglow in nesting ) {
      // debugger;
      for(let i = 0; i < children.length; i++) {

        const pp = path+i+'.';
        // console.log("calling with path: "+ pp);

        this.recurse(children[i], depth+1, pp, hierarchy+taglow+'.');
      }
    } else if( taglow === 'action' || taglow === 'condition' ) {
      // debugger;
      let fn = props.ID;
      // let a = t[key]; // xml parser likes to put things in 1 depth array
      // this.recurseSeq(t[key][0], depth+1);
      this.loadPath(path+'0', hierarchy+taglow, fn, props);

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
  logger: ABTLogger;

  logPath: string;

  async setFileLogger(l: ABTLogger, path: string): Promise<void> {
    this.logger = l;

    await this.logger.start();
    await this.logger.setFilePath(path);
    this.logPath = path;

    this.logger.registerActionNodes(this.getActionNodes());
    this.logger.registerConditionNodes(this.getConditionNodes());
    this.logger.parseXML(this.rawXml);

    this.writeNodeUID();
  }


  zmq: ABTZmqLogger;


  // istanbul ignore next
  async setZmqLogger(l: any, z: ABTZmqLogger): Promise<void> {
    this.logger = l;
    this.zmq = z;

    await this.logger.start();

    this.zmqTransitions = 0;
    this.logger.writeToCallback(this.zmqGotTransition.bind(this));


    await this.logger.start();
    this.logger.registerActionNodes(this.getActionNodes());
    this.logger.registerConditionNodes(this.getConditionNodes());
    this.logger.parseXML(this.rawXml);

    this.writeNodeUID();
  }

  zmqTransitions: number = 0;

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

    if( cnlow in this.nestingTypes ) {
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

  logPrevState: number = 0;

  private logTransition(node: any, pop: boolean, result?: boolean): void {
    if( !this.logger ) {
      return;
    }

    const nest = (node.w in this.nestingTypes);

    if( nest ) {

      if( !pop ) {
        this.logger.logTransition(node.uid, 0, 1);
      } else {

        let cur = 3;

        if( !!result ) {
          cur = 2;
        }

        // if( node.w === 'fallback' ) {
        //   cur = 0;
        // }
      
        this.logger.logTransition(node.uid, 0, cur);

      }

    } else {

      let cur = 3;

      if( !!result ) {
        cur = 2;
      }

      this.logger.logTransition(node.uid, 0, cur);
    }

  }

}


export {
AsyncBehaviorTree
}
