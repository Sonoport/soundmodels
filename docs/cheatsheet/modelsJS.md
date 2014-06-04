#JS Models and Params#
======

### Looper ###
Loops the source continuously

_Combines the functionality of MP3SoundPlayer, Looper and MultiTrackLooper._

```
AS3 Model Name = Looper (MultiTrackLooper, MP3SoundPlayer)
maxSources = 8
```

##### Params
```
playSpeed  - [-10.0f, 0.0f, 10.0f]     
riseTime   - [0.05f,1.0f,10.0f]
decayTime  - [0.05f,1.0f,10.0f]
maxLoops   - [-1*,-1,1]
startPoint - [0.0f,0.0f, 0.99f]
```
\* = `-1` implies infinite loops.

<hr>

### Extender ###

Extends an ambient sound inifinitely without making it feel repeated.

```
AS3 Model Name = Extender
maxSources = 1
```

##### Params
```
pitchShift    - [-60.0f, 0.0f, 60.0f]     
eventPeriod   - [0.1f,2.0f,10.0f]
xFadeDur      - [0.1f, 0.5f, 0.99f]
```

<hr>

### Trigger ###

Triggers a single playback of the source on the `play()` function call.

```
AS3 Model Name = Trigger
maxSources = 8
```

##### Params
```
pitchShift   - [-60.0f, 0.0f, 60.0f]     
pitchRand    - [0.0f,0.0f,24.0f]
eventRand    - [true, false, false]
```

<hr>

### MultiTrigger ###

Triggers a repeated playback of the source. 

```
AS3 Model Name = TriggerRepeat
maxSources = 8
```

##### Params
```
pitchShift   - [-60.0f, 0.0f, 60.0f]     
pitchRand    - [0.0f,0.0f,24.0f]
eventRand    - [true, false, false]
eventRate    - [0.0f, 1.0f, 60.0f]
eventJitter  - [0.0f, 0.0f, 0.99f]
```
<hr>

### Activity ###

Loops the source audio repeatedly. The speed the playback is based on the rate of change of `action` parameter.

```
AS3 Model Name = Scrubber
maxSources = 1
```

##### Params
```
action         - [0.0f, 0.0f, 1.0f]     
sensitivity    - [0.00f,0.5f, 1.0f]
riseTime       - [0.05f,1.0f,10.0f]
decayTime      - [0.05f,1.0f,10.0f]
startPoint     - [0.0f,0.0f, 0.99f]
maxRate        - [0.0f, 1.0f, 8.0f]
```
<hr>

### Scrubber ###

Allows for 'scrubbing' of the audio source by setting the `playPos` to various continuous values.

```
AS3 Model Name = ScrubberPitchLock
maxSources = 1
```


##### Params
```
playPos        - [0.0f, 0.0f, 1.0f]
noMotionFade   - [true, true, false]
muteOnReverse  - [true, true, false]
```
<hr>

### AudioStretch ###

Allows the stretching of the source audio independently in time (speed) and pitch (frequency).

_This is yet to be implemented_

```
AS3 Model Name = AudioStretch
maxSources = 1
```


##### Params
```
playSpeed  - [0.0f, 1.0f, 2.0f]
pitch      - [-12.0f,0.0f, 12.0f]
origPhase  - [true, false, false]
peakLock   - [true, true, false]
```
<hr>