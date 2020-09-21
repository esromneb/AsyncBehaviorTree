# .PHONY: wasm all

# all: wasm


.PHONY: all build watch dev start test pretest lint jestc
.PHONY: test

build:
	npm run build

test: jestc
	npm run test

jestc:
	npm run jestc

# jest watch tests
jestw:
	npm run jestw


clean:
	npm run clean

