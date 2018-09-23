class AppMailer < Devise::Mailer
  helper :application, :mailer, :input_sanitize
  include Devise::Controllers::UrlHelpers
  default template_path: 'users/mailer'
  default from: ENV['MAIL_FROM']
  default reply: ENV['MAIL_REPLYTO']

  def notification(user, notification, opts = {})
    @user = user
    @notification = notification
    subject =
      if notification.deliver?
        I18n.t('notifications.deliver.email_subject')
      else
        I18n.t('notifications.email_title')
      end
    headers = {
      to: @user.email,
      subject: subject
    }.merge(opts)
    mail(headers)
  end
end
