package net.java.dualquizz.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.xml.bind.annotation.XmlRootElement;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;
import org.hibernate.annotations.GenericGenerator;

/**
 * Represents a player of a DualQuizz game
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Entity
@XmlRootElement
@NamedQueries({
 @NamedQuery(name = Player.KEY_PLAYER_SELECT_FROM_MAIL, query = "select p from Player p where p.mail = :key"),
 @NamedQuery(name = Player.KEY_PLAYER_COUNT_FROM_MAIL, query = "select count(p) from Player p where p.mail = :key")   
})
public class Player implements Serializable {
    private static final long serialVersionUID = 1L;
    
    public static final String KEY_PLAYER_SELECT_FROM_MAIL = "player.selectFromMail";
    public static final String KEY_PLAYER_COUNT_FROM_MAIL = "player.countFromMail";
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    private String mail;
    private String firstName;
    private String lastName;
   
   
    @ElementCollection
    private List<String> badges = new ArrayList<>();
    
    private int points = 0;
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Player)) {
            return false;
        }
        Player other = (Player) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "net.java.endless.empire.webempire.model.Player[ id=" + id + " ]";
    }

    /**
     * @return the eMail
     */
    public String getMail() {
        return mail;
    }

    /**
     * @param mail the eMail to set
     */
    public void setMail(String mail) {
        this.mail = mail;
    }

    /**
     * @return the firstName
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * @param firstName the firstName to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * @return the lastName
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * @param lastName the lastName to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * @return the badges
     */
    public List<String> getBadges() {
        return badges;
    }

    /**
     * @param badges the badges to set
     */
    public void setBadges(List<String> badges) {
        this.badges = badges;
    }

    /**
     * @return the points
     */
    public int getPoints() {
        return points;
    }

    /**
     * @param points the points to set
     */
    public void setPoints(int points) {
        this.points = points;
    }
    
}
