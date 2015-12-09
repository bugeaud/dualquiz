package service;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Resource;
import javax.ejb.Stateless;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import net.java.dualquizz.model.Player;

/**
 * Notification Service to send e-mail to user
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Stateless
public class NotificationService {

    private static final Logger log = Logger.getLogger(NotificationService.class.getName());
    
    @Resource(name="mail/NotificationSession")
    private Session session;
    
    /**
     * Send a notification thru the regular chanel (email)
     * @param player the player to target
     * @param message the message to deliver
     */
    public void notifyPlayer(final Player player,String title, String message) {

        try {
            final String mailAddress = player.getMail();
            Message mail = new MimeMessage(session);
            mail.setFrom();
            mail.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(mailAddress, false));
            mail.setSubject(title);
            final Date timeStamp = new Date();

            mail.setText(message);

            mail.setHeader("X-Mailer", "DualQuizz");
            mail.setSentDate(timeStamp);

            // Send message
            Transport.send(mail);
            log.log(Level.INFO,"Mail was sent to {0}",mailAddress);
    } catch (MessagingException ex) {
        log.log(Level.WARNING, "Unable to send message for the given adress using the given context. Check them both.",ex);
    }
        
        
    }

    
}
