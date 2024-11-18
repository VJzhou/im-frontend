<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput } from 'naive-ui'
import { ServeRegister } from '@/api/auth'
import { ServeSendEmailCode } from '@/api/common'
import { isEmail } from '@/utils/validate'
import { useSmsLock } from '@/hooks'

// 初始化短信按钮锁
const { lockTime, start } = useSmsLock('REGISTER_SMS', 60)

const router = useRouter()
const formRef = ref()
const rules = {
  nickname: {
    required: true,
    trigger: ['blur', 'input'],
    message: '昵称不能为空！'
  },
  email: {
    required: true,
    // @ts-ignore
    validator(rule: any, value: string) {
      if (!value) {
        return new Error('邮箱不能为空！')
      } else if (!isEmail(value)) {
        return new Error('请正确填写邮箱！')
      }

      return true
    },
    trigger: ['blur', 'input']
  },
  password: {
    required: true,
    trigger: ['blur', 'input'],
    message: '密码不能为空！'
  },
  code: {
    required: true,
    trigger: ['blur', 'input'],
    message: '验证码不能为空！'
  }
}

const model = reactive({
  nickname: '',
  email: '',
  password: '',
  code: '',
  loading: false
})

const onRegister = () => {
  model.loading = true

  const response = ServeRegister({
    nickname: model.nickname,
    email: model.email,
    password: model.password,
    code: model.code,
    platform: 'web'
  })

  response.then((res) => {
    if (res.code == 0) {
      window['$message'].success('注册成功')

      setTimeout(() => {
        router.push('/auth/login')
      }, 500)
    } else {
      window['$message'].warning(res.msg)
    }
  })

  response.finally(() => {
    model.loading = false
  })
}

const onValidate = (e) => {
  e.preventDefault()

  formRef.value.validate((errors) => {
    !errors && onRegister()
  })
}

// 发送邮件
const onSendEmail = () => {
  if (!isEmail(model.email)) {
    window['$message'].warning('请正确填写邮箱')
    return
  }

  const response = ServeSendEmailCode({
    email: model.email,
  })

  response.then((res) => {
    console.log(res)
    if (res.code == 0) {
      start()

      window['$message'].success('邮箱发送成功')
      res.data.is_debug = true
      if (res.data.is_debug) {
        model.code = res.data.code
        setTimeout(() => {
          window['$message'].success('已开启验证码自动填充')
        }, 1000)
      }
    } else {
      window['$message'].warning(res.msg)
    }
  })

  response.finally(() => {
    model.loading = false
  })
}
</script>

<template>
  <section class="el-container is-vertical login-box reister">
    <header class="el-header box-header">账号注册</header>

    <main class="el-main" style="padding: 3px">
      <n-form ref="formRef" size="large" :model="model" :rules="rules">
        <n-form-item path="email" :show-label="false">
          <n-input
            placeholder="请输入邮箱"
            v-model:value="model.email"
            :maxlength="11"
            @keydown.enter="onValidate"
          />
        </n-form-item>

        <n-form-item path="code" :show-label="false">
          <n-input
            placeholder="验证码"
            v-model:value="model.code"
            :maxlength="6"
            @keydown.enter="onValidate"
          />
          <n-button tertiary class="mt-l5" @click="onSendEmail" :disabled="lockTime > 0">
            获取验证码 <span v-show="lockTime > 0">({{ lockTime }}s)</span>
          </n-button>
        </n-form-item>

        <n-form-item path="nickname" :show-label="false">
          <n-input
            placeholder="设置昵称"
            v-model:value="model.nickname"
            @keydown.enter="onValidate"
          />
        </n-form-item>

        <n-form-item path="password" :show-label="false">
          <n-input
            placeholder="设置密码"
            type="password"
            show-password-on="click"
            v-model:value="model.password"
            @keydown.enter="onValidate"
          />
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          block
          class="mt-t20"
          @click="onValidate"
          :loading="model.loading"
        >
          立即注册
        </n-button>
      </n-form>

      <div class="helper">
        <n-button text color="#409eff" @click="router.push('/auth/forget')"> 找回密码 </n-button>
        <n-button text color="#409eff" @click="router.push('/auth/login')">
          已有账号，立即登录?
        </n-button>
      </div>
    </main>
  </section>
</template>

<style lang="less" scoped>
@import '@/assets/css/login.less';
</style>
