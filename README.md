# `drone-ssh`

This is a plugin for `drone` CI.

You can use it to ssh into some server and execute commands.

## usage

```
steps:
  - name: ssh
    image: are1000/drone-ssh:latest
    settings:
      host: example.com             # server that you want to ssh into
      username: foo                 # username for ssh
      private_key_path: ./key       # path to file with private key
      env:                          # (optional) object that allows you to extend the ENVIRONMENT
        foo: value
        bar: {{foo}}                #   you can use handlebars to substitute for env variables
      script:                       # list of commands to execute
        - echo "Hello world"
        - echo "{{foo}} {{bar}}"    #   you can use handlebars to substitute for env variables
```
