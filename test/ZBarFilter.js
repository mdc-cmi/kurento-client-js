/*
 * (C) Copyright 2013 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

/**
 * {@link HttpEndpoint} test suite.
 * 
 * <p>
 * Methods tested:
 * <ul>
 * <li>{@link HttpEndpoint#getUrl()}
 * </ul>
 * <p>
 * Events tested:
 * <ul>
 * <li>{@link HttpEndpoint#addMediaSessionStartListener(MediaEventListener)}
 * <li>
 * {@link HttpEndpoint#addMediaSessionTerminatedListener(MediaEventListener)}
 * </ul>
 * 
 * 
 * @author Jesús Leganés Combarro "piranna" (piranna@gmail.com)
 * @version 1.0.0
 * 
 */

if(typeof QUnit == 'undefined')
{
  QUnit = require('qunit-cli');

  wock = require('wock');

  KwsMedia = require('..');
};


var PlayerEndpoint = KwsMedia.endpoints.PlayerEndpoint;
var ZBarFilter     = KwsMedia.filters.ZBarFilter;


var timeoutDelay = 5 * 1000;


QUnit.module('ZBarFilter', lifecycle);

QUnit.asyncTest('Create pipeline and play video', function()
{
  QUnit.expect(4);

  kwsMedia.on('connect', function()
  {
    kwsMedia.createMediaPipeline(function(error, pipeline)
    {
      if(error) return onerror(error);

      QUnit.notEqual(pipeline, undefined, 'pipeline');

      PlayerEndpoint.create(pipeline, {uri: URL_BARCODES},
      function(error, player)
      {
        if(error) return onerror(error);

        QUnit.notEqual(player, undefined, 'player');

        ZBarFilter.create(pipeline, function(error, zbar)
        {
          if(error) return onerror(error);

          QUnit.notEqual(zbar, undefined, 'zbar');

          pipeline.connect(player, zbar, function(error, pipeline)
          {
            if(error) return onerror(error);

            QUnit.notEqual(pipeline, undefined, 'connect');

            player.play(function(error)
            {
              if(error) return onerror(error);

              QUnit.start();
            });
          });
        });
      });
    })
  });
});

QUnit.asyncTest('Detect bar-code in a video', function()
{
  QUnit.expect(1);

  kwsMedia.on('connect', function()
  {
    kwsMedia.createMediaPipeline(function(error, pipeline)
    {
      if(error) return onerror(error);

      PlayerEndpoint.create(pipeline, {uri: URL_BARCODES},
      function(error, player)
      {
        if(error) return onerror(error);

        ZBarFilter.create(pipeline, function(error, zbar)
        {
          if(error) return onerror(error);

          var timeout;

          pipeline.connect(player, zbar, function(error, pipeline)
          {
            if(error) return onerror(error);

            player.play(function(error)
            {
              if(error) return onerror(error);

              timeout = setTimeout(function()
              {
                onerror('Time out');
              },
              timeoutDelay);
            });
          });

          zbar.on('CodeFound', function(data)
          {
            QUnit.ok(true, 'CodeFound');

            clearTimeout(timeout);

            QUnit.start();
          });
        });
      });
    })
  });
});
