import * as D from '../src/decorators'
import { MetadataKey } from '../src/constants'
import { cleanGlobalControllerList } from './utils'

describe('Decorators', () => {
  afterEach(cleanGlobalControllerList)

  describe('@controller', () => {

    test('ControllerConstructor metadata should be added to decorated class', () => {
      @D.controller('/foo', {options: {tags: ['bar']}})
      class Foo {

      }

      expect(Reflect.hasMetadata(MetadataKey.controller, Foo)).toBeTruthy()
      expect(Reflect.getMetadata(MetadataKey.controller, Foo)).toEqual({
        target:    Foo,
        basePath:  '/foo',
        routeSpec: {
          options: {
            tags: ['bar'],
          },
        },
      })
    })

    test('ControllerConstructor metadata should be added to global list of controllers', () => {
      @D.controller('/foo', {options: {tags: ['bar']}})
      class Foo {}

      expect(Reflect.hasMetadata(MetadataKey.controller, Reflect)).toBeTruthy()
      expect(Reflect.getMetadata(MetadataKey.controller, Reflect)).toEqual([
        {
          target:    Foo,
          basePath:  '/foo',
          routeSpec: {
            options: {
              tags: ['bar'],
            },
          },
        },
      ])
    })

    test('Error is thrown if controller is decorated more than once', () => {
      expect(() => {
        @D.controller()
        @D.controller()
        class Foo {}
      }).toThrow()
    })
  })

  describe('@route', () => {
    test('Route metadata should be added to list of route metadata in constructor of the class', () => {
      class Foo {
        @D.route({path: '/bar'})
        bar() {}
      }

      expect(Reflect.hasMetadata(MetadataKey.route, Foo)).toBeTruthy()
      expect(Reflect.getMetadata(MetadataKey.route, Foo)).toEqual([
        {
          handlerName: 'bar',
          routeSpec:   {path: '/bar'},
        },
      ])
    })
  })

  describe('Decorators based on @route', () => {
    test.each([

      //decorator      arguments                  expected route spec

      ['method',       ['GET'],                   { method: 'GET' } ],
      ['method',       ['GET', '/foo'],           { method: 'GET', path: '/foo' } ],
      ['method',       [['GET', 'POST'], '/foo'], { method: ['GET', 'POST'], path: '/foo' } ],
      ['get',          [],                        { method: 'GET' } ],
      ['get',          ['/foo'],                  { method: 'GET', path: '/foo' } ],
      ['post',         [],                        { method: 'POST' } ],
      ['post',         ['/foo'],                  { method: 'POST', path: '/foo' } ],
      ['put',          [],                        { method: 'PUT' } ],
      ['put',          ['/foo'],                  { method: 'PUT', path: '/foo' } ],
      ['patch',        [],                        { method: 'PATCH' } ],
      ['patch',        ['/foo'],                  { method: 'PATCH', path: '/foo' } ],
      ['del',          [],                        { method: 'DELETE' } ],
      ['del',          ['/foo'],                  { method: 'DELETE', path: '/foo' } ],
      ['options',      [],                        { method: 'OPTIONS' } ],
      ['options',      ['/foo'],                  { method: 'OPTIONS', path: '/foo' } ],
      ['all',          [],                        { method: '*' } ],
      ['all',          ['/foo'],                  { method: '*', path: '/foo' } ],
      ['path',         ['/foo'],                  { path: '/foo' } ],
      ['vhost',        ['foo.com'],               { vhost: 'foo.com' } ],
      ['vhost',        [['foo.com', 'bar.com']],  { vhost: ['foo.com', 'bar.com'] } ],
      ['rules',        [{foo: 123}],              { rules: {foo: 123} } ],
      ['routeOptions', [{foo: 123}],              { options: {foo: 123} } ],
      ['routeOption',  ['foo', 123],              { options: {foo: 123} } ],
      ['cache',        [123],                     { options: {cache: 123} } ],
      ['cors',         [123],                     { options: {cors: 123} } ],
      ['description',  [123],                     { options: {description: 123} } ],
      ['notes',        [123],                     { options: {notes: 123} } ],
      ['plugin',       ['foo', {bar: 123}],       { options: {plugins: {foo: {bar: 123}}} } ],
      ['pre',          [123],                     { options: {pre: 123} } ],
      ['response',     [123],                     { options: {response: 123} } ],
      ['security',     [123],                     { options: {security: 123} } ],
      ['tags',         [123],                     { options: {tags: 123} } ],
      ['validate',     [123],                     { options: {validate: 123} } ],

    ])('@%s with args %p', (name, args, expectedSpec) => {
      const decorator = (<any>D)[name]

      @D.controller()
      class Foo {
        @decorator(...args)
        bar() {

        }
      }

      expect(Reflect.getMetadata(MetadataKey.route, Foo)[0].routeSpec).toEqual(expectedSpec)
    })
  })

  describe('Argument decorators', () => {
    test('Arguments metadata should be added to list of route argument metadata in constructor of the class', () => {
      class Foo {
        @D.route({path: '/bar'})
        bar(
          @D.param('foo', 'baz') foo: string,
          @D.queryParam('qux')   qux: string,
          @D.cookie('quux')      quux: string,
          @D.payload()           body: any,
          @D.payload('baz')      baz: any,
          @D.request()           req: any,
          @D.responseToolkit()   h: any,
          @D.req()               req2: any,
          @D.res()               h2: any,
        ) {

        }
      }

      expect(Reflect.hasMetadata(MetadataKey.argument, Foo)).toBeTruthy()
      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toHaveLength(9)

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'param',
          handlerName:  'bar',
          index:        0,
          name:         'foo',
          defaultValue: 'baz',
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'query',
          handlerName:  'bar',
          index:        1,
          name:         'qux',
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'cookie',
          handlerName:  'bar',
          index:        2,
          name:         'quux',
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'payload',
          handlerName:  'bar',
          index:        3,
          name:         undefined,
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'payload',
          handlerName:  'bar',
          index:        4,
          name:         'baz',
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'request',
          handlerName:  'bar',
          index:        5,
          name:         undefined,
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'responseToolkit',
          handlerName:  'bar',
          index:        6,
          name:         undefined,
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'request',
          handlerName:  'bar',
          index:        7,
          name:         undefined,
          defaultValue: undefined,
        },
      )

      expect(Reflect.getMetadata(MetadataKey.argument, Foo)).toContainEqual(
        {
          type:         'responseToolkit',
          handlerName:  'bar',
          index:        8,
          name:         undefined,
          defaultValue: undefined,
        },
      )
    })
  })
})
